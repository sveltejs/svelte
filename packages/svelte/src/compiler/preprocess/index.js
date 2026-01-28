/** @import { Processed, Preprocessor, MarkupPreprocessor, PreprocessorGroup } from './public.js' */
/** @import { SourceUpdate, Source } from './private.js' */
/** @import { DecodedSourceMap, RawSourceMap } from '@jridgewell/remapping' */
import { getLocator } from 'locate-character';
import {
	MappedCode,
	parse_attached_sourcemap,
	sourcemap_add_offset,
	combine_sourcemaps,
	get_basename
} from '../utils/mapped_code.js';
import { decode_map } from './decode_sourcemap.js';
import { replace_in_code, slice_source } from './replace_in_code.js';

/**
 * Represents intermediate states of the preprocessing.
 * Implements the Source interface.
 */
class PreprocessResult {
	/** @type {string} */
	source;

	/** @type {string | undefined} The filename passed as-is to preprocess */
	filename;

	// sourcemap_list is sorted in reverse order from last map (index 0) to first map (index -1)
	// so we use sourcemap_list.unshift() to add new maps
	// https://github.com/jridgewell/sourcemaps/tree/main/packages/remapping#multiple-transformations-of-a-file

	/**
	 * @default []
	 * @type {Array<DecodedSourceMap | RawSourceMap>}
	 */
	sourcemap_list = [];

	/**
	 * @default []
	 * @type {string[]}
	 */
	dependencies = [];

	/**
	 * @type {string | null} last part of the filename, as used for `sources` in sourcemaps
	 */
	file_basename = /** @type {any} */ (undefined);

	/**
	 * @type {ReturnType<typeof getLocator>}
	 */
	get_location = /** @type {any} */ (undefined);

	/**
	 * @param {string} source
	 * @param {string} [filename]
	 */
	constructor(source, filename) {
		this.source = source;
		this.filename = filename;
		this.update_source({ string: source });
		// preprocess source must be relative to itself or equal null
		this.file_basename = filename == null ? null : get_basename(filename);
	}

	/**
	 * @param {SourceUpdate} opts
	 */
	update_source({ string: source, map, dependencies }) {
		if (source != null) {
			this.source = source;
			this.get_location = getLocator(source);
		}
		if (map) {
			this.sourcemap_list.unshift(map);
		}
		if (dependencies) {
			this.dependencies.push(...dependencies);
		}
	}

	/**
	 * @returns {Processed}
	 */
	to_processed() {
		// Combine all the source maps for each preprocessor function into one
		// @ts-expect-error TODO there might be a bug in hiding here
		const map = combine_sourcemaps(this.file_basename, this.sourcemap_list);
		return {
			// TODO return separated output, in future version where svelte.compile supports it:
			// style: { code: styleCode, map: styleMap },
			// script { code: scriptCode, map: scriptMap },
			// markup { code: markupCode, map: markupMap },
			code: this.source,
			dependencies: [...new Set(this.dependencies)],
			// @ts-expect-error TODO there might be a bug in hiding here
			map,
			toString: () => this.source
		};
	}
}
/**
 * Convert preprocessor output for the tag content into MappedCode
 * @param {Processed} processed
 * @param {{ line: number; column: number; }} location
 * @param {string} file_basename
 * @returns {MappedCode}
 */
function processed_content_to_code(processed, location, file_basename) {
	// Convert the preprocessed code and its sourcemap to a MappedCode

	/**
	 * @type {DecodedSourceMap | undefined}
	 */
	let decoded_map = undefined;
	if (processed.map) {
		decoded_map = decode_map(processed);
		// decoded map may not have sources for empty maps like `{ mappings: '' }`
		if (decoded_map?.sources) {
			// offset only segments pointing at original component source
			const source_index = decoded_map.sources.indexOf(file_basename);
			if (source_index !== -1) {
				sourcemap_add_offset(decoded_map, location, source_index);
			}
		}
	}
	return MappedCode.from_processed(processed.code, decoded_map);
}
/**
 * Given the whole tag including content, return a `MappedCode`
 * representing the tag content replaced with `processed`.
 * @param {Processed} processed
 * @param {'style' | 'script'} tag_name
 * @param {string} original_attributes
 * @param {string} generated_attributes
 * @param {Source} source
 * @returns {MappedCode}
 */
function processed_tag_to_code(
	processed,
	tag_name,
	original_attributes,
	generated_attributes,
	source
) {
	const { file_basename, get_location } = source;

	/**
	 * @param {string} code
	 * @param {number} offset
	 */
	const build_mapped_code = (code, offset) =>
		MappedCode.from_source(slice_source(code, offset, source));

	// To map the open/close tag and content starts positions correctly, we need to
	// differentiate between the original attributes and the generated attributes:
	// `source` contains the original attributes and its get_location maps accordingly.
	const original_tag_open = `<${tag_name}${original_attributes}>`;
	const tag_open = `<${tag_name}${generated_attributes}>`;
	/** @type {MappedCode} */
	let tag_open_code;

	if (original_tag_open.length !== tag_open.length) {
		// Generate a source map for the open tag
		/** @type {DecodedSourceMap['mappings']} */
		const mappings = [
			[
				// start of tag
				[0, 0, 0, 0],
				// end of tag start
				[`<${tag_name}`.length, 0, 0, `<${tag_name}`.length]
			]
		];

		const line = tag_open.split('\n').length - 1;
		const column = tag_open.length - (line === 0 ? 0 : tag_open.lastIndexOf('\n')) - 1;

		while (mappings.length <= line) {
			// end of tag start again, if this is a multi line mapping
			mappings.push([[0, 0, 0, `<${tag_name}`.length]]);
		}

		// end of tag
		mappings[line].push([
			column,
			0,
			original_tag_open.split('\n').length - 1,
			original_tag_open.length - original_tag_open.lastIndexOf('\n') - 1
		]);

		/** @type {DecodedSourceMap} */
		const map = {
			version: 3,
			names: [],
			sources: [file_basename],
			mappings
		};
		sourcemap_add_offset(map, get_location(0), 0);
		tag_open_code = MappedCode.from_processed(tag_open, map);
	} else {
		tag_open_code = build_mapped_code(tag_open, 0);
	}

	const tag_close = `</${tag_name}>`;
	const tag_close_code = build_mapped_code(
		tag_close,
		original_tag_open.length + source.source.length
	);

	parse_attached_sourcemap(processed, tag_name);
	const content_code = processed_content_to_code(
		processed,
		get_location(original_tag_open.length),
		file_basename
	);

	return tag_open_code.concat(content_code).concat(tag_close_code);
}

const attribute_pattern = /([\w-$]+\b)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;

/**
 * @param {string} str
 */
function parse_tag_attributes(str) {
	/** @type {Record<string, string | boolean>} */
	const attrs = {};

	/** @type {RegExpMatchArray | null} */
	let match;
	while ((match = attribute_pattern.exec(str)) !== null) {
		const name = match[1];
		const value = match[2] || match[3] || match[4];
		attrs[name] = !value || value;
	}

	return attrs;
}

/**
 * @param {Record<string, string | boolean> | undefined} attributes
 */
function stringify_tag_attributes(attributes) {
	if (!attributes) return;

	let value = Object.entries(attributes)
		.map(([key, value]) => (value === true ? key : `${key}="${value}"`))
		.join(' ');
	if (value) {
		value = ' ' + value;
	}
	return value;
}

const regex_style_tags =
	/<!--[^]*?-->|<style((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:\/>|>([\S\s]*?)<\/style>)/g;
const regex_script_tags =
	/<!--[^]*?-->|<script((?:\s+[^=>'"/\s]+=(?:"[^"]*"|'[^']*'|[^>\s]+)|\s+[^=>'"/\s]+)*\s*)(?:\/>|>([\S\s]*?)<\/script>)/g;

/**
 * Calculate the updates required to process all instances of the specified tag.
 * @param {'style' | 'script'} tag_name
 * @param {Preprocessor} preprocessor
 * @param {Source} source
 * @returns {Promise<SourceUpdate>}
 */
async function process_tag(tag_name, preprocessor, source) {
	const { filename, source: markup } = source;
	const tag_regex = tag_name === 'style' ? regex_style_tags : regex_script_tags;

	/**
	 * @type {string[]}
	 */
	const dependencies = [];

	/**
	 * @param {string} tag_with_content
	 * @param {number} tag_offset
	 * @returns {Promise<MappedCode>}
	 */
	async function process_single_tag(tag_with_content, attributes = '', content = '', tag_offset) {
		const no_change = () =>
			MappedCode.from_source(slice_source(tag_with_content, tag_offset, source));
		if (!attributes && !content) return no_change();
		const processed = await preprocessor({
			content: content || '',
			attributes: parse_tag_attributes(attributes || ''),
			markup,
			filename
		});
		if (!processed) return no_change();
		if (processed.dependencies) dependencies.push(...processed.dependencies);
		if (!processed.map && processed.code === content) return no_change();
		return processed_tag_to_code(
			processed,
			tag_name,
			attributes,
			stringify_tag_attributes(processed.attributes) ?? attributes,
			slice_source(content, tag_offset, source)
		);
	}
	const { string, map } = await replace_in_code(tag_regex, process_single_tag, source);
	return { string, map, dependencies };
}

/**
 * @param {MarkupPreprocessor} process
 * @param {Source} source
 */
async function process_markup(process, source) {
	const processed = await process({
		content: source.source,
		filename: source.filename
	});
	if (processed) {
		return {
			string: processed.code,
			map: processed.map
				? // TODO: can we use decode_sourcemap?
					typeof processed.map === 'string'
					? JSON.parse(processed.map)
					: processed.map
				: undefined,
			dependencies: processed.dependencies
		};
	} else {
		return {};
	}
}

/**
 * The preprocess function provides convenient hooks for arbitrarily transforming component source code.
 * For example, it can be used to convert a `<style lang="sass">` block into vanilla CSS.
 *
 * @param {string} source
 * @param {PreprocessorGroup | PreprocessorGroup[]} preprocessor
 * @param {{ filename?: string }} [options]
 * @returns {Promise<Processed>}
 */
export default async function preprocess(source, preprocessor, options) {
	/**
	 * @type {string | undefined}
	 */
	const filename = (options && options.filename) || /** @type {any} */ (preprocessor).filename; // legacy
	const preprocessors = preprocessor
		? Array.isArray(preprocessor)
			? preprocessor
			: [preprocessor]
		: [];
	const result = new PreprocessResult(source, filename);

	// TODO keep track: what preprocessor generated what sourcemap?
	// to make debugging easier = detect low-resolution sourcemaps in fn combine_mappings
	for (const preprocessor of preprocessors) {
		if (preprocessor.markup) {
			// @ts-expect-error TODO there might be a bug in hiding here
			result.update_source(await process_markup(preprocessor.markup, result));
		}
		if (preprocessor.script) {
			// @ts-expect-error TODO there might be a bug in hiding here
			result.update_source(await process_tag('script', preprocessor.script, result));
		}
		if (preprocessor.style) {
			// @ts-expect-error TODO there might be a bug in hiding here
			result.update_source(await process_tag('style', preprocessor.style, result));
		}
	}

	return result.to_processed();
}
