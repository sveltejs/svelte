import { SourceMap } from 'magic-string';
import replaceAsync from '../utils/replaceAsync';

export interface PreprocessOptions {
	markup?: (options: {
		content: string,
		filename: string
	}) => { code: string, map?: SourceMap | string };
	style?: Preprocessor;
	script?: Preprocessor;
	filename?: string
}

export type Preprocessor = (options: {
	content: string,
	attributes: Record<string, string | boolean>,
	filename?: string
}) => { code: string, map?: SourceMap | string };

interface Processed {
	code: string;
	map?: SourceMap | string;
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
	options: PreprocessOptions
) {
	if (options.markup) {
		const processed: Processed = await options.markup({
			content: source,
			filename: options.filename,
		});
		source = processed ? processed.code : source;
	}
	if (options.style || options.script) {
		source = await replaceAsync(
			source,
			/<(script|style)([^]*?)>([^]*?)<\/\1>/gi,
			async (match, type, attributes, content) => {
				const processed: Processed =
					type in options &&
					(await options[type]({
						content,
						attributes: parseAttributes(attributes),
						filename: options.filename,
					}));
				return processed ? `<${type}${attributes}>${processed.code}</${type}>` : match;
			}
		);
	}

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		toString() {
			return source;
		}
	};
}
