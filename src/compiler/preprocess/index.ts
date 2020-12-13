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

function get_file_basename(filename: string) {
	return filename.split(/[/\\]/).pop();
}

interface Replacement {
	offset: number;
	length: number;
	replacement: StringWithSourcemap;
}

async function replace_async(
	file_basename: string,
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
			file_basename, source.slice(last_end, offset), get_location(last_end));
		out.concat(content).concat(replacement);
		last_end = offset + length;
	}
	// final_content = unchanged source characters after last replaced segment
	const final_content = StringWithSourcemap.from_source(
		file_basename, source.slice(last_end), get_location(last_end));
	return out.concat(final_content);
}

/**
 * Import decoded sourcemap from mozilla/source-map/SourceMapGenerator
 * Forked from source-map/lib/source-map-generator.js
 * from methods _serializeMappings and toJSON.
 * We cannot use source-map.d.ts types, because we access hidden properties.
 */
function decoded_sourcemap_from_generator(generator: any) {
	let previous_generated_line = 1;
	const converted_mappings = [[]];
	let result_line;
	let result_segment;
	let mapping;

	const source_idx = generator._sources.toArray()
		.reduce((acc, val, idx) => (acc[val] = idx, acc), {});

	const name_idx = generator._names.toArray()
		.reduce((acc, val, idx) => (acc[val] = idx, acc), {});

	const mappings = generator._mappings.toArray();
	result_line = converted_mappings[0];

	for (let i = 0, len = mappings.length; i < len; i++) {
		mapping = mappings[i];

		if (mapping.generatedLine > previous_generated_line) {
			while (mapping.generatedLine > previous_generated_line) {
				converted_mappings.push([]);
				previous_generated_line++;
			}
			result_line = converted_mappings[mapping.generatedLine - 1]; // line is one-based
		} else if (i > 0) {
			const previous_mapping = mappings[i - 1];
			if (
				// sorted by selectivity
				mapping.generatedColumn === previous_mapping.generatedColumn &&
				mapping.originalColumn === previous_mapping.originalColumn &&
				mapping.name === previous_mapping.name &&
				mapping.generatedLine === previous_mapping.generatedLine &&
				mapping.originalLine === previous_mapping.originalLine &&
				mapping.source === previous_mapping.source
		) {
				continue;
			}
		}
		result_line.push([mapping.generatedColumn]);
		result_segment = result_line[result_line.length - 1];

		if (mapping.source != null) {
			result_segment.push(...[
				source_idx[mapping.source],
				mapping.originalLine - 1, // line is one-based
				mapping.originalColumn
			]);
			if (mapping.name != null) {
				result_segment.push(name_idx[mapping.name]);
			}
		}
	}

	const map = {
		version: generator._version,
		sources: generator._sources.toArray(),
		names: generator._names.toArray(),
		mappings: converted_mappings
	};
	if (generator._file != null) {
		(map as any).file = generator._file;
	}
	// not needed: map.sourcesContent and map.sourceRoot
	return map;
}

/**
 * Convert a preprocessor output and its leading prefix and trailing suffix into StringWithSourceMap
 */
function get_replacement(
	file_basename: string,
	offset: number,
	get_location: ReturnType<typeof getLocator>,
	original: string,
	processed: Processed,
	prefix: string,
	suffix: string
): StringWithSourcemap {

	// Convert the unchanged prefix and suffix to StringWithSourcemap
	const prefix_with_map = StringWithSourcemap.from_source(
		file_basename, prefix, get_location(offset));
	const suffix_with_map = StringWithSourcemap.from_source(
		file_basename, suffix, get_location(offset + prefix.length + original.length));

	// Convert the preprocessed code and its sourcemap to a StringWithSourcemap
	let decoded_map: DecodedSourceMap;
	if (processed.map) {
		decoded_map = typeof processed.map === 'string' ? JSON.parse(processed.map) : processed.map;
		if (typeof(decoded_map.mappings) === 'string') {
			decoded_map.mappings = decode_mappings(decoded_map.mappings);
		}
		if ((decoded_map as any)._mappings && decoded_map.constructor.name === 'SourceMapGenerator') {
			// import decoded sourcemap from mozilla/source-map/SourceMapGenerator
			decoded_map = decoded_sourcemap_from_generator(decoded_map);
		}
		// offset only segments pointing at original component source
		const source_index = decoded_map.sources.indexOf(file_basename);
		if (source_index !== -1) {
			sourcemap_add_offset(decoded_map, get_location(offset + prefix.length), source_index);
		}
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

	// preprocess source must be relative to itself or equal null
	const file_basename = filename == null ? null : get_file_basename(filename);

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
		const tag_regex = tag_name === 'style'
			? /<!--[^]*?-->|<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi
			: /<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi;

		const res = await replace_async(
			file_basename,
			source,
			get_location,
			tag_regex,
			async (match, attributes = '', content = '', offset) => {
				const no_change = () => StringWithSourcemap.from_source(
					file_basename, match, get_location(offset));
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
				if (processed && processed.dependencies) {
					dependencies.push(...processed.dependencies);
				}
				if (!processed || !processed.map && processed.code === content) {
					return no_change();
				}
				return get_replacement(file_basename, offset, get_location, content, processed, `<${tag_name}${attributes}>`, `</${tag_name}>`);
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
		file_basename,
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
