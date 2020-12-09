import { RawSourceMap, DecodedSourceMap } from '@ampproject/remapping/dist/types/types';
import { getLocator } from 'locate-character';
import { StringWithSourcemap, SourceLocation, sourcemap_add_offset, combine_sourcemaps } from '../utils/string_with_sourcemap';
import { decode_map } from './decode_sourcemap';
import parse_tag_attributes from './parse_tag_attributes';
import { replace_in_code, Source } from './replace_in_code';
import { Preprocessor, PreprocessorGroup, Processed } from './types';

interface SourceUpdate {
	string: string;
	map?: DecodedSourceMap;
	dependencies?: string[];
}

/**
 * Represents intermediate states of the preprocessing.
 */
class PreprocessResult {
	// sourcemap_list is sorted in reverse order from last map (index 0) to first map (index -1)
	// so we use sourcemap_list.unshift() to add new maps
	// https://github.com/ampproject/remapping#multiple-transformations-of-a-file
	sourcemap_list: Array<DecodedSourceMap | RawSourceMap> = [];
	dependencies: string[] = [];

	get_location: ReturnType<typeof getLocator>;

	constructor(public source: string, public filename: string) {
		this.update_source({ string: source });
	}

	update_source({ string: source, map, dependencies }: SourceUpdate) {
		this.source = source;
		this.get_location = getLocator(source);

		if (map) {
			this.sourcemap_list.unshift(map);
		}

		if (dependencies) {
			this.dependencies.push(...dependencies);
		}
	}

	to_processed(): Processed {
		// Combine all the source maps for each preprocessor function into one
		const map: RawSourceMap = combine_sourcemaps(this.filename, this.sourcemap_list);

		return {
			// TODO return separated output, in future version where svelte.compile supports it:
			// style: { code: styleCode, map: styleMap },
			// script { code: scriptCode, map: scriptMap },
			// markup { code: markupCode, map: markupMap },

			code: this.source,
			dependencies: [...new Set(this.dependencies)],
			map: map as object,
			toString: () => this.source
		};
	}
}

/**
 * Convert preprocessor output for the tag content into StringWithSourceMap
 */
function processed_content_to_sws(
	processed: Processed,
	location: SourceLocation
): StringWithSourcemap {
	// Convert the preprocessed code and its sourcemap to a StringWithSourcemap
	let decoded_map: DecodedSourceMap;
	if (processed.map) {
		decoded_map = decode_map(processed);
		
		sourcemap_add_offset(decoded_map, location);
	}

	return StringWithSourcemap.from_processed(processed.code, decoded_map);
}

/**
 * Given the whole tag including content, return a `StringWithSourcemap`
 * representing the tag content replaced with `processed`.
 */
function processed_tag_to_sws(
	processed: Processed,
	tag_name: 'style' | 'script',
	attributes: string,
	{ source, filename, get_location }: Source): StringWithSourcemap {
	const build_sws = (source: string, offset: number) =>
		StringWithSourcemap.from_source(filename, source, get_location(offset));

	const tag_open = `<${tag_name}${attributes || ''}>`;
	const tag_close = `</${tag_name}>`;

	const tag_open_sws = build_sws(tag_open, 0);
	const tag_close_sws = build_sws(tag_close, tag_open.length + source.length);

	const content_sws = processed_content_to_sws(processed, get_location(tag_open.length));

	return tag_open_sws.concat(content_sws).concat(tag_close_sws);
}

/** 
 * Calculate the updates required to process all instances of the specified tag. 
 */
async function process_tag(
	tag_name: 'style' | 'script',
	preprocessor: Preprocessor,
	source: Source
): Promise<SourceUpdate> {
	const { filename, get_location } = source;
	const tag_regex =
		tag_name === 'style'
			? /<!--[^]*?-->|<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi
			: /<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi;

	const dependencies: string[] = [];

	async function process_single_tag(
		tag_with_content: string,
		attributes = '',
		content = '',
		tag_offset: number
	): Promise<StringWithSourcemap> {
		const no_change = () =>
			StringWithSourcemap.from_source(filename, tag_with_content, get_location(tag_offset));

		if (!attributes && !content) return no_change();

		const processed = await preprocessor({
			content: content || '',
			attributes: parse_tag_attributes(attributes || ''),
			filename
		});

		if (!processed) return no_change();
		if (processed.dependencies) dependencies.push(...processed.dependencies);

		return processed_tag_to_sws(processed, tag_name, attributes,
			{source: content, get_location: offset => source.get_location(offset + tag_offset), filename});
	}

	return {...await replace_in_code(tag_regex, process_single_tag, source), dependencies};
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
): Promise<Processed> {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy

	const preprocessors = preprocessor
		? Array.isArray(preprocessor) ? preprocessor : [preprocessor]
		: [];

	const markup = preprocessors.map(p => p.markup).filter(Boolean);
	const script = preprocessors.map(p => p.script).filter(Boolean);
	const style = preprocessors.map(p => p.style).filter(Boolean);

	const result = new PreprocessResult(source, filename);

	// TODO keep track: what preprocessor generated what sourcemap?
	// to make debugging easier = detect low-resolution sourcemaps in fn combine_mappings

	for (const process of markup) {
		const processed = await process({
			content: result.source,
			filename
		});

		if (!processed) continue;

		result.update_source({
			string: processed.code,
			map: processed.map
				? // TODO: can we use decode_sourcemap?
				  typeof processed.map === 'string'
					? JSON.parse(processed.map)
					: processed.map
				: undefined,
			dependencies: processed.dependencies
		});
	}

	for (const process of script) {
		result.update_source(await process_tag('script', process, result));
	}

	for (const preprocess of style) {
		result.update_source(await process_tag('style', preprocess, result));
	}

	return result.to_processed();
}
