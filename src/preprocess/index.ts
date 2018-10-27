import { SourceMap } from 'magic-string';

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

async function replaceTagContents(
	source,
	type: 'script' | 'style',
	preprocessor: Preprocessor,
	options: PreprocessOptions
) {
	const exp = new RegExp(`<${type}([\\S\\s]*?)>([\\S\\s]*?)<\\/${type}>`, 'ig');
	const match = exp.exec(source);

	if (match) {
		const attributes: Record<string, string | boolean> = parseAttributes(match[1]);
		const content: string = match[2];
		const processed: { code: string, map?: SourceMap | string } = await preprocessor({
			content,
			attributes,
			filename : options.filename
		});

		if (processed && processed.code) {
			return (
				source.slice(0, match.index) +
				`<${type}>${processed.code}</${type}>` +
				source.slice(match.index + match[0].length)
			);
		}
	}

	return source;
}

export default async function preprocess(
	source: string,
	options: PreprocessOptions
) {
	const { markup, style, script } = options;

	if (!!markup) {
		const processed: {
			code: string,
			map?: SourceMap | string
		} = await markup({
			content: source,
			filename: options.filename
		});

		source = processed.code;
	}

	if (!!style) {
		source = await replaceTagContents(source, 'style', style, options);
	}

	if (!!script) {
		source = await replaceTagContents(source, 'script', script, options);
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