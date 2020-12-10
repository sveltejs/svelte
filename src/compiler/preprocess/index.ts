import { RawSourceMap, DecodedSourceMap } from '@ampproject/remapping/dist/types/types';
import { getLocator } from 'locate-character';
import { StringWithSourcemap, SourceLocation, sourcemap_add_offset, combine_sourcemaps } from '../utils/string_with_sourcemap';
import { decode_map } from './decode_sourcemap';
import parse_tag_attributes from './parse_tag_attributes';
import { perform_replacements, Source, Replacement } from './replace_in_code';
import { Preprocessor, SyncPreprocessor, PreprocessorGroup, Processed } from './types';

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


interface TagInstance {
	tag_with_content: string, 
	attributes: string, 
	content: string, 
	tag_offset: number;
}

export function get_tag_instances(tag: 'style'|'script', source: string): TagInstance[] {
	const tag_regex =
		tag === 'style'
			? /<!--[^]*?-->|<style(\s[^]*?)?(?:>([^]*?)<\/style>|\/>)/gi
			: /<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi;

	const instances: TagInstance[] = [];

	source.replace(tag_regex, (...match) => {
		const [tag_with_content, attributes, content, tag_offset] = match;

		instances.push({
			tag_with_content,
			attributes: attributes || '',
			content: content || '',
			tag_offset
		});

		return '';
	});

	return instances;
}

function to_source_update(tags: TagInstance[], processed: Processed[], tag_name: 'style' | 'script', source: Source) {
	const { filename, get_location } = source;
	const dependencies: string[] = [];

	const replacements: Replacement[] = processed.map((processed, idx) => {
		const match = tags[idx];
		const {tag_with_content, attributes, content, tag_offset} = match;

		let sws: StringWithSourcemap;

		if (!processed) {
			sws = StringWithSourcemap.from_source(filename, tag_with_content, get_location(tag_offset));
		} else {
			if (processed.dependencies) dependencies.push(...processed.dependencies);
	
			sws = processed_tag_to_sws(processed, tag_name, attributes, {
				source: content,
				get_location: offset => source.get_location(offset + tag_offset),
				filename
			});	
		}

		return { offset: tag_offset, length: tag_with_content.length, replacement: sws };
	});

	return {...perform_replacements(replacements, source), dependencies};
}

/** 
 * Calculate the updates required to process all instances of the specified tag. 
 */
async function process_tag(
	tag_name: 'style' | 'script',
	preprocessor: Preprocessor | SyncPreprocessor,
	source: Source
): Promise<SourceUpdate> {
	const { filename } = source;
	
	const tags = get_tag_instances(tag_name, source.source);
	
	const processed = await Promise.all<Processed>(tags.map(({attributes, content}) => {
		if (attributes || content) {			
			return preprocessor({
				content,
				attributes: parse_tag_attributes(attributes || ''),
				filename
			});
		}
	}));

	return to_source_update(tags, processed, tag_name, source);
}

function process_tag_sync(
	tag_name: 'style' | 'script',
	preprocessor: SyncPreprocessor,
	source: Source
): SourceUpdate {
	const { filename } = source;
	
	const tags = get_tag_instances(tag_name, source.source);
	
	const processed: Processed[] = tags.map(({attributes, content}) => {
		if (attributes || content) {			
			return preprocessor({
				content,
				attributes: parse_tag_attributes(attributes || ''),
				filename
			});
		}
	});

	return to_source_update(tags, processed, tag_name, source);
}

function decode_preprocessor_params(
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
) {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy

	const preprocessors = preprocessor ? (Array.isArray(preprocessor) ? preprocessor : [preprocessor]) : [];

	const markup = preprocessors.map(p => p.markup).filter(Boolean);
	const script = preprocessors.map(p => p.script).filter(Boolean);
	const style = preprocessors.map(p => p.style).filter(Boolean);

	return { markup, script, style, filename };
}

function is_sync(processor: Preprocessor | SyncPreprocessor): processor is SyncPreprocessor {
	return processor['is_sync'];
}

export function preprocess_sync(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
): Processed {
	const { markup, script, style, filename } = decode_preprocessor_params(preprocessor, options);

	const result = new PreprocessResult(source, filename);

	// TODO keep track: what preprocessor generated what sourcemap?
	// to make debugging easier = detect low-resolution sourcemaps in fn combine_mappings

	for (const process of markup) {
		if (is_sync(process)) {
			const processed = process({
				content: result.source,
				filename,
				attributes: null
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
	}

	for (const process of script) {
		if (is_sync(process)) {
			result.update_source(process_tag_sync('script', process, result));
		}
	}

	for (const process of style) {
		if (is_sync(process)) {
			result.update_source(process_tag_sync('style', process, result));
		}
	}

	return result.to_processed();
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
): Promise<Processed> {
	const { markup, script, style, filename } = decode_preprocessor_params(preprocessor, options);

	const result = new PreprocessResult(source, filename);

	// TODO keep track: what preprocessor generated what sourcemap?
	// to make debugging easier = detect low-resolution sourcemaps in fn combine_mappings

	for (const process of markup) {
		const processed = await process({
			content: result.source,
			filename,
			attributes: null
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

	for (const process of style) {
		result.update_source(await process_tag('style', process, result));
	}

	return result.to_processed();
}
