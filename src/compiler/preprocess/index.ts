import remapper from '@ampproject/remapping';
import { decode } from 'sourcemap-codec';
import { getLocator } from 'locate-character';
import { GeneratedStringWithMap, offset_source_location } from '../utils/string_with_map';


export interface Processed {
	code: string;
	map?: object | string;
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
	replacement: GeneratedStringWithMap;
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
) {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy
	const dependencies = [];

	const preprocessors = Array.isArray(preprocessor) ? preprocessor : [preprocessor];

	const markup = preprocessors.map(p => p.markup).filter(Boolean);
	const script = preprocessors.map(p => p.script).filter(Boolean);
	const style = preprocessors.map(p => p.style).filter(Boolean);
	const source_maps: Array<Processed['map']> = [];

	let source_locator: ReturnType<typeof getLocator>;

	function get_replacement(offset: number, original: string, processed: Processed, prefix: string, suffix: string): GeneratedStringWithMap {
		const generated_prefix = GeneratedStringWithMap.from_source(filename, prefix, source_locator(offset));
		const generated_suffix = GeneratedStringWithMap.from_source(filename, suffix, source_locator(offset + prefix.length + original.length));

		let generated;
		if (processed.map) {
			const full_map = typeof processed.map === "string" ? JSON.parse(processed.map) : processed.map;
			const decoded_map = { ...full_map, mappings: decode(full_map.mappings) };
			const processed_offset = source_locator(offset + prefix.length);
			generated = GeneratedStringWithMap.from_generated(processed.code, offset_source_location(processed_offset, decoded_map));
		} else {
			generated = GeneratedStringWithMap.from_generated(processed.code);
		}
		const map = generated_prefix.concat(generated).concat(generated_suffix);
		return map;
	}

	async function replace_async(str: string, re: RegExp, func: (...any) => Promise<GeneratedStringWithMap>): Promise<GeneratedStringWithMap> {
		const replacement_promises: Array<Promise<Replacement>> = [];
		str.replace(re, (...args) => {
			replacement_promises.push(
				func(...args).then(
					(replacement) =>
						({
							offset: args[args.length - 2],
							length: args[0].length,
							replacement
						}) as Replacement
				)
			);
			return '';
		});
		const replacements = await Promise.all(replacement_promises);

		let out: GeneratedStringWithMap;
		let last_end = 0;
		for (const { offset, length, replacement } of replacements)
		{
			const content = GeneratedStringWithMap.from_source(filename, str.slice(last_end, offset), source_locator(last_end));
			out = out ? out.concat(content) : content;
			out = out.concat(replacement);
			last_end = offset + length;
		}
		const final_content = GeneratedStringWithMap.from_source(filename, str.slice(last_end), source_locator(last_end));
		out = out.concat(final_content);
		return out;
	}
	
	for (const fn of markup) {
		const processed = await fn({
			content: source,
			filename
		});
		if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
		source = processed ? processed.code : source;
		if (processed && processed.map) source_maps.unshift(processed.map);
	}

	for (const fn of script) {
		source_locator = getLocator(source);
		const res = await replace_async(
			source,
			/<!--[^]*?-->|<script(\s[^]*?)?(?:>([^]*?)<\/script>|\/>)/gi,
			async (match, attributes = '', content, offset) => {
				const no_change = () => GeneratedStringWithMap.from_source(filename, match, source_locator(offset));

				if (!attributes && !content) {
					return no_change();
				}

				attributes = attributes || '';
				const processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});

				if (!processed) return no_change();
				if (processed.dependencies) dependencies.push(...processed.dependencies);
				return get_replacement(offset, content, processed, `<script${attributes}>`, `</script>`);
			}
		);
		source = res.generated;
		source_maps.unshift(res.as_sourcemap());
	}

	for (const fn of style) {
		source_locator = getLocator(source);
		const res = await replace_async(
			source,
			/<!--[^]*?-->|<style(\s[^]*?)?>([^]*?)<\/style>/gi,
			async (match, attributes = '', content, offset) => {
				const no_change = () => GeneratedStringWithMap.from_source(filename, match, source_locator(offset));
				if (!attributes && !content) {
					return no_change();
				}

				const processed: Processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});

				if (!processed) return no_change();
				if (processed.dependencies) dependencies.push(...processed.dependencies);
				return get_replacement(offset, content, processed, `<style${attributes}>`, `</style>`);
			}
		);

		source = res.generated;
		source_maps.unshift(res.as_sourcemap());
	}

	const map: ReturnType<typeof remapper> = source_maps.length == 0 ? null : remapper(source_maps as any, () => null);
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
