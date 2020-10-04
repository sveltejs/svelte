import { SourceMapInput, RawSourceMap, DecodedSourceMap } from '@ampproject/remapping/dist/types/types';
import { decode as decode_mappings } from 'sourcemap-codec';
import { getLocator } from 'locate-character';
import { StringWithSourcemap, sourcemap_add_offset, combine_sourcemaps, combine_sourcemaps_map_stats } from '../utils/string_with_sourcemap';

export interface Processed {
	code: string;
	map?: SourceMapInput;
	dependencies?: string[];
}

export interface PreprocessorGroup {
	markup?: (options: {
		content: string;
		filename: string;
	}) => Processed | Promise<Processed>;
	style?: Preprocessor;
	script?: Preprocessor;
}

export type Preprocessor = (options: {
	content: string;
	attributes: Record<string, string | boolean>;
	filename?: string;
}) => Processed | Promise<Processed>;

function parse_attributes(str: string) {
	const attrs = {};
	str.split(/\s+/).filter(Boolean).forEach(attr => {
		const p = attr.indexOf('=');
		if (p === -1) {
			attrs[attr] = true;
		} else {
			attrs[attr.slice(0, p)] = `'"`.includes(attr[p + 1]) ?
				attr.slice(p + 2, -1) :
				attr.slice(p + 1);
		}
	});
	return attrs;
}

interface Replacement {
	offset: number;
	length: number;
	replacement: StringWithSourcemap;
}

async function replace_async(
	filename: string,
	source: string,
	get_location: ReturnType<typeof getLocator>,
	re: RegExp,
	func: (...any) => Promise<StringWithSourcemap>
): Promise<StringWithSourcemap> {
	const replacements: Array<Promise<Replacement>> = [];
	source.replace(re, (...args) => {
		replacements.push(
			func(...args).then(
				res =>
					({
						offset: args[args.length - 2],
						length: args[0].length,
						replacement: res
					}) as Replacement
			)
		);
		return '';
	});
	const out = new StringWithSourcemap();
	let last_end = 0;
	for (const { offset, length, replacement } of await Promise.all(
		replacements
	)) {
		// content = source before replacement
		const content = StringWithSourcemap.from_source(
			filename, source.slice(last_end, offset), get_location(last_end));
		out.concat(content).concat(replacement);
		last_end = offset + length;
	}
	// final_content = source after last replacement
	const final_content = StringWithSourcemap.from_source(
		filename, source.slice(last_end), get_location(last_end));
	return out.concat(final_content);
}

function get_replacement(
	filename: string,
	offset: number,
	get_location: ReturnType<typeof getLocator>,
	original: string,
	processed: Processed,
	prefix: string,
	suffix: string
): StringWithSourcemap {
	const prefix_with_map = StringWithSourcemap.from_source(
		filename, prefix, get_location(offset));
	const suffix_with_map = StringWithSourcemap.from_source(
		filename, suffix, get_location(offset + prefix.length + original.length));

	let decoded_map;
	if (processed.map) {
		decoded_map = typeof processed.map === "string" ? JSON.parse(processed.map) : processed.map;
		if (typeof(decoded_map.mappings) === 'string')
			decoded_map.mappings = decode_mappings(decoded_map.mappings);
		sourcemap_add_offset(decoded_map, get_location(offset + prefix.length));
	}
	const processed_with_map = StringWithSourcemap.from_processed(processed.code, decoded_map);

	return prefix_with_map.concat(processed_with_map).concat(suffix_with_map);
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: {
		filename?: string,
		sourcemapWarnLoss?: number, // default 0.5
		sourcemapEncodedWarn?: boolean // default true
	}
) {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy
	const sourcemapWarnLoss = (options && options.sourcemapWarnLoss != undefined) ? options.sourcemapWarnLoss : 0.5;
	const sourcemapEncodedWarn = (options && options.sourcemapEncodedWarn != undefined) ? options.sourcemapEncodedWarn : true;

	const dependencies = [];

	const preprocessors = preprocessor
		? Array.isArray(preprocessor) ? preprocessor : [preprocessor]
		: []; // noop

	const markup = preprocessors.map(p => p.markup).filter(Boolean);
	const script = preprocessors.map(p => p.script).filter(Boolean);
	const style = preprocessors.map(p => p.style).filter(Boolean);

	// sourcemap_list is sorted in reverse order from last map (index 0) to first map (index -1)
	// so we use sourcemap_list.unshift() to add new maps
	// https://github.com/ampproject/remapping#multiple-transformations-of-a-file
	const sourcemap_list: Array<DecodedSourceMap | RawSourceMap> = [];

	// TODO keep track: what preprocessor generated what sourcemap? to make debugging easier = detect low-resolution sourcemaps in fn combine_mappings

	for (const fn of markup) {

		// run markup preprocessor
		const processed = await fn({
			content: source,
			filename
		});

		if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
		source = processed ? processed.code : source;
		if (processed && processed.map)
			sourcemap_list.unshift(
				typeof(processed.map) === 'string'
					? JSON.parse(processed.map) as RawSourceMap
					: processed.map as (RawSourceMap | DecodedSourceMap)
			);
	}

	// TODO run script and style in parallel

	for (const fn of script) {
		const get_location = getLocator(source);
		const res = await replace_async(
			filename,
			source,
			get_location,
			/<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi,
			async (match, attributes = '', content = '', offset) => {
				const no_change = () => StringWithSourcemap.from_source(
					filename, match, get_location(offset));
				if (!attributes && !content) {
					return no_change();
				}
				attributes = attributes || '';
				content = content || '';

				// run script preprocessor
				const processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});

				if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
				return processed
					? get_replacement(filename, offset, get_location, content, processed, `<script${attributes}>`, `</script>`)
					: no_change();
			}
		);
		source = res.string;
		sourcemap_list.unshift(res.map);
	}

	for (const fn of style) {
		const get_location = getLocator(source);
		const res = await replace_async(
			filename,
			source,
			get_location,
			/<!--[^]*?-->|<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi,
			async (match, attributes = '', content = '', offset) => {
				const no_change = () => StringWithSourcemap.from_source(
					filename, match, get_location(offset));
				if (!attributes && !content) {
					return no_change();
				}
				attributes = attributes || '';
				content = content || '';

				// run style preprocessor
				const processed: Processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});

				if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
				return processed
					? get_replacement(filename, offset, get_location, content, processed, `<style${attributes}>`, `</style>`)
					: no_change();
			}
		);
		source = res.string;
		sourcemap_list.unshift(res.map);
	}

	const map_stats: combine_sourcemaps_map_stats = {
		sourcemapWarnLoss,
		sourcemapEncodedWarn
		// property `result` is set by combine_sourcemaps
	};

	const map: DecodedSourceMap = combine_sourcemaps(
		filename,
		sourcemap_list,
		map_stats,
		true // explicitly decode mappings
		// TODO remove this, when `remapping` allows to return decoded mappings, so we skip the unnecessary encode + decode steps
	) as DecodedSourceMap;

	// TODO better than console.log?

	if (map_stats.result && map_stats.result.segments_lost) {
		const { segment_loss_per_map, segments_per_map } = map_stats.result;
		console.log('warning. svelte.preprocess seems to receive low-resolution sourcemaps. '+
			'relative segment loss per combine_sourcemaps step: '+
			segment_loss_per_map.map(f => f.toFixed(2)).join(' -> ')+
			'. absolute number of segments per sourcemap: '+
			segments_per_map.join(' -> ')+
			'. make your preprocessors return high-resolution sourcemaps '+
			'or increase the tolerated loss with svelte.preprocess(_, _, { sourcemapWarnLoss: 0.8 })'
		);
	}

	if (map_stats.result && map_stats.result.maps_encoded && map_stats.result.maps_encoded.length > 0) {
		console.log('warning. svelte.preprocess received encoded sourcemaps (index '+
			map_stats.result.maps_encoded.join(', ')+'). '+
			'this is slow. make your sourcemap-generators return decoded mappings '+
			'or disable this warning with svelte.preprocess(_, _, { sourcemapEncodedWarn: false })'
		);
	}

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		code: source,
		dependencies: [...new Set(dependencies)],
		map,

		toString() {
			return source;
		}
	};
}
