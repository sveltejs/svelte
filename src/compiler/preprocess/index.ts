import remapper from '@ampproject/remapping';
import { decode as sourcemap_decode } from 'sourcemap-codec';
import { getLocator } from 'locate-character';
import { StringWithSourcemap, sourcemap_add_offset } from '../utils/string_with_sourcemap';


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
	let out: StringWithSourcemap;
	let last_end = 0;
	for (const { offset, length, replacement } of await Promise.all(
		replacements
	)) {
		// content = source before replacement
		const content = StringWithSourcemap.from_source(
			filename, source.slice(last_end, offset), get_location(last_end));
		out = out ? out.concat(content) : content;
		out = out.concat(replacement);
		last_end = offset + length;
	}
	// final_content = source after last replacement
	const final_content = StringWithSourcemap.from_source(
		filename, source.slice(last_end), get_location(last_end));
	out = out.concat(final_content);
	return out;
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
	const generated_prefix = StringWithSourcemap.from_source(
		filename, prefix, get_location(offset));
	const generated_suffix = StringWithSourcemap.from_source(
		filename, suffix, get_location(offset + prefix.length + original.length));

	let generated;
	if (processed.map) {
		const full_map = typeof processed.map === "string" ? JSON.parse(processed.map) : processed.map;
		const decoded_map = { ...full_map, mappings: sourcemap_decode(full_map.mappings) };
		const processed_offset = get_location(offset + prefix.length);
		generated = StringWithSourcemap.from_generated(processed.code, sourcemap_add_offset(processed_offset, decoded_map));
	} else {
		generated = StringWithSourcemap.from_generated(processed.code);
	}
	const map = generated_prefix.concat(generated).concat(generated_suffix);
	return map;
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
		: []; // noop

	const markup = preprocessors.map(p => p.markup).filter(Boolean);
	const script = preprocessors.map(p => p.script).filter(Boolean);
	const style = preprocessors.map(p => p.style).filter(Boolean);

	// sourcemap_list is sorted in reverse order from last map (index 0) to first map (index -1)
	// so we use sourcemap_list.unshift() to add new maps
	// https://github.com/ampproject/remapping#multiple-transformations-of-a-file
	const sourcemap_list: Array<Processed['map']> = [];

	for (const fn of markup) {

		// run markup preprocessor
		const processed = await fn({
			content: source,
			filename
		});

		if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
		source = processed ? processed.code : source;
		if (processed && processed.map) sourcemap_list.unshift(processed.map);
	}

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
		source = res.generated;
		sourcemap_list.unshift(res.get_sourcemap());
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
		source = res.generated;
		sourcemap_list.unshift(res.get_sourcemap());
	}

	// https://github.com/ampproject/remapping#usage
	// https://github.com/mozilla/source-map#new-sourcemapconsumerrawsourcemap
	const map: ReturnType<typeof remapper> =
		sourcemap_list.length == 0
			? null
			: remapper(sourcemap_list as any, () => null, true); // true: skip optional field `sourcesContent`

	if (map) delete map.file; // skip optional field `file`

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
