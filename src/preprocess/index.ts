import { SourceMap } from 'magic-string';
import replaceAsync from '../utils/replaceAsync';

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

function parseAttributeValue(value: string) {
	return /^['"]/.test(value) ?
		value.slice(1, -1) :
		value;
}

function parseAttributes(str: string) {
	const attrs = {};
	str.split(/\s+/).filter(Boolean).forEach(attr => {
		const [name, value] = attr.split('=');
		attrs[name] = value ? parseAttributeValue(value) : true;
	});
	return attrs;
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string }
) {
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
		source = await replaceAsync(
			source,
			/<script([^]*?)>([^]*?)<\/script>/gi,
			async (match, attributes, content) => {
				const processed: Processed = await fn({
					content,
					attributes: parseAttributes(attributes),
					filename
				});
				if (processed && processed.dependencies) dependencies.push(...processed.dependencies);
				return processed ? `<script${attributes}>${processed.code}</script>` : match;
			}
		);
	}

	for (const fn of style) {
		source = await replaceAsync(
			source,
			/<style([^]*?)>([^]*?)<\/style>/gi,
			async (match, attributes, content) => {
				const processed: Processed = await fn({
					content,
					attributes: parseAttributes(attributes),
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
