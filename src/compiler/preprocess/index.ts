import { RawSourceMap, DecodedSourceMap } from '@ampproject/remapping/dist/types/types';
import { decode as decode_mappings } from 'sourcemap-codec';
import { getLocator } from 'locate-character';
import { StringWithSourcemap, sourcemap_add_offset, combine_sourcemaps } from '../utils/string_with_sourcemap';

export interface Processed {
	code: string;
	map?: string | object;  // we are opaque with the type here to avoid dependency on the remapping module for our public types.
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
			attrs[attr.slice(0, p)] = '\'"'.includes(attr[p + 1]) ?
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
		// content = unchanged source characters before the replaced segment
		const content = StringWithSourcemap.from_source(
			filename, source.slice(last_end, offset), get_location(last_end));
		out.concat(content).concat(replacement);
		last_end = offset + length;
	}
	// final_content = unchanged source characters after last replaced segment
	const final_content = StringWithSourcemap.from_source(
		filename, source.slice(last_end), get_location(last_end));
	return out.concat(final_content);
}

/** 
 * Convert a preprocessor output and its leading prefix and trailing suffix into StringWithSourceMap  
 */
function get_replacement(
	filename: string,
	offset: number,
	get_location: ReturnType<typeof getLocator>,
	original: string,
	processed: Processed,
	prefix: string,
	suffix: string
): StringWithSourcemap {

	// Convert the unchanged prefix and suffix to StringWithSourcemap
	const prefix_with_map = StringWithSourcemap.from_source(
		filename, prefix, get_location(offset));
	const suffix_with_map = StringWithSourcemap.from_source(
		filename, suffix, get_location(offset + prefix.length + original.length));

	// Convert the preprocessed code and its sourcemap to a StringWithSourcemap
	let decoded_map: DecodedSourceMap;
	if (processed.map) {
		decoded_map = typeof processed.map === 'string' ? JSON.parse(processed.map) : processed.map;
		if (typeof(decoded_map.mappings) === 'string') {
			decoded_map.mappings = decode_mappings(decoded_map.mappings);
		}
		sourcemap_add_offset(decoded_map, get_location(offset + prefix.length));
	}
	const processed_with_map = StringWithSourcemap.from_processed(processed.code, decoded_map);

	// Surround the processed code with the prefix and suffix, retaining valid sourcemappings
	return prefix_with_map.concat(processed_with_map).concat(suffix_with_map);
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
) {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy
	const dependencies = [];

	const preprocessors = preprocessor
		? Array.isArray(preprocessor) ? preprocessor : [preprocessor]
		: [];

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

		if (!processed) continue;

		if (processed.dependencies) dependencies.push(...processed.dependencies);
		source = processed.code;
		if (processed.map) {
			sourcemap_list.unshift(
				typeof(processed.map) === 'string'
					? JSON.parse(processed.map)
					: processed.map
			);
		}
	}

	async function preprocess_tag_content(tag_name: 'style' | 'script', preprocessor: Preprocessor) {
		const get_location = getLocator(source);
		const tag_regex = tag_name == 'style' 
			? /<!--[^]*?-->|<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi
			: /<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi;

		const res = await replace_async(
			filename,
			source,
			get_location,
			tag_regex,
			async (match, attributes = '', content = '', offset) => {
				const no_change = () => StringWithSourcemap.from_source(
					filename, match, get_location(offset));
				if (!attributes && !content) {
					return no_change();
				}
				attributes = attributes || '';
				content = content || '';

				// run script preprocessor
				const processed = await preprocessor({
					content,
					attributes: parse_attributes(attributes),
					filename
				});

				if (!processed) return no_change();
				if (processed.dependencies) dependencies.push(...processed.dependencies);
				return get_replacement(filename, offset, get_location, content, processed, `<${tag_name}${attributes}>`, `</${tag_name}>`);
			}
		);
		source = res.string;
		sourcemap_list.unshift(res.map);
	}

	for (const fn of script) {
		await preprocess_tag_content('script', fn);
	}

	for (const fn of style) {
		await preprocess_tag_content('style', fn);
	}

	// Combine all the source maps for each preprocessor function into one
	const map: RawSourceMap = combine_sourcemaps(
		filename,
		sourcemap_list
	);

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		code: source,
		dependencies: [...new Set(dependencies)],
		map: (map as object),
		toString() {
			return source;
		}
	};
}
