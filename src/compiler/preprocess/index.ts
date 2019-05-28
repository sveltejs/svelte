import { SourceMap } from 'magic-string';

export interface PreprocessorGroup {
	markup?: (options: {
		content: string,
		filename: string
	}) => { code: string, map?: SourceMap | string, dependencies?: string[] };
	style?: Preprocessor;
	script?: Preprocessor;
}

export type Preprocessor = (options: {
	content: string,
	attributes: Record<string, string | boolean>,
	filename?: string
}) => { code: string, map?: SourceMap | string, dependencies?: string[] };

interface Processed {
	code: string;
	map?: SourceMap | string;
	dependencies?: string[];
}

function parse_attribute_value(value: string) {
	return /^['"]/.test(value) ?
		value.slice(1, -1) :
		value;
}

function parse_attributes(str: string) {
	const attrs = {};
	str.split(/\s+/).filter(Boolean).forEach(attr => {
		const [name, value] = attr.split('=');
		attrs[name] = value ? parse_attribute_value(value) : true;
	});
	return attrs;
}

interface Replacement {
	offset: number;
	length: number;
	replacement: string;
}

async function replace_async(str: string, re: RegExp, func: (...any) => Promise<string>) {
	const replacements: Promise<Replacement>[] = [];
	str.replace(re, (...args) => {
		replacements.push(
			func(...args).then(
				res =>
					<Replacement>({
						offset: args[args.length - 2],
						length: args[0].length,
						replacement: res,
					})
			)
		);
		return '';
	});
	let out = '';
	let last_end = 0;
	for (const { offset, length, replacement } of await Promise.all(
		replacements
	)) {
		out += str.slice(last_end, offset) + replacement;
		last_end = offset + length;
	}
	out += str.slice(last_end);
	return out;
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

	for (const fn of markup) {
		const processed: Processed = await fn({
			content: source,
			filename
		});
		if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
		source = processed ? processed.code : source;
	}

	for (const fn of script) {
		source = await replace_async(
			source,
			/<script(\s[^]*?)?>([^]*?)<\/script>/gi,
			async (match, attributes = '', content) => {
				const processed: Processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});
				if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
				return processed ? `<script${attributes}>${processed.code}</script>` : match;
			}
		);
	}

	for (const fn of style) {
		source = await replace_async(
			source,
			/<style(\s[^]*?)?>([^]*?)<\/style>/gi,
			async (match, attributes = '', content) => {
				const processed: Processed = await fn({
					content,
					attributes: parse_attributes(attributes),
					filename
				});
				if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
				return processed ? `<style${attributes}>${processed.code}</style>` : match;
			}
		);
	}

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		code: source,
		dependencies: [...new Set(dependencies)],

		toString() {
			return source;
		}
	};
}
