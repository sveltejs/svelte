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
	replacement: string;
}

async function replace_async(str: string, re: RegExp, func: (...any) => Promise<string>) {
	const replacements: Array<Promise<Replacement>> = [];
	str.replace(re, (...args) => {
		replacements.push(
			func(...args).then(
				res =>
					({
						offset: args[args.length - 2],
						length: args[0].length,
						replacement: res,
					}) as Replacement
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

async function process_markup(
	source: string,
	func: (...any) => Processed | Promise<Processed>,
	filename: string,
) {

	const processed: Processed = await func({
		content: source,
		filename
	});

	return {
		source: processed ? processed.code : source,
		dependencies: processed.dependencies
	};
}

async function process_script(
	source: string,
	func: (...any) => Processed | Promise<Processed>,
	filename: string,
) {
	const dependencies = [];

	source = await replace_async(
		source,
		/<!--[^]*?-->|<script(\s[^]*?)?>([^]*?)<\/script>/gi,
		async (match, attributes = '', content) => {
			if (!attributes && !content) {
				return match;
			}
			attributes = attributes || '';
			const processed: Processed = await func({
				content,
				attributes: parse_attributes(attributes),
				filename
			});
			if (processed && processed.dependencies) {
				dependencies.push(...processed.dependencies);
			}

			return processed ? `<script${attributes}>${processed.code}</script>` : match;
		}
	);

	return {
		source,
		dependencies,
	};
}

async function process_style(
	source: string,
	func: (...any) => Processed | Promise<Processed>,
	filename: string,
) {
	const dependencies = [];

	source = await replace_async(
		source,
		/<!--[^]*?-->|<style(\s[^]*?)?>([^]*?)<\/style>/gi,
		async (match, attributes = '', content) => {
			if (!attributes && !content) {
				return match;
			}
			const processed: Processed = await func({
				content,
				attributes: parse_attributes(attributes),
				filename
			});

			if (processed && processed.dependencies) {
				dependencies.push(...processed.dependencies);
			}

			return processed ? `<style${attributes}>${processed.code}</style>` : match;
		}
	);

	return {
		source,
		dependencies,
	};
}

function merge_preprocessors(preprocessors: PreprocessorGroup[]): PreprocessorGroup[] {
	return [
		...preprocessors.map(({ markup }) => ({ markup })),
		...preprocessors.map(({ script }) => ({ script })),
		...preprocessors.map(({ style }) => ({ style })),
	];
}

export default async function preprocess(
	source: string,
	preprocessor: PreprocessorGroup | PreprocessorGroup[],
	options?: { filename?: string; strictOrder?: boolean }
) {
	// @ts-ignore todo: doublecheck
	const filename = (options && options.filename) || preprocessor.filename; // legacy
	const strictOrder = options && options.strictOrder;
	const dependencies = [];

	const preprocessors = Array.isArray(preprocessor) ? preprocessor : [preprocessor];

	const order = strictOrder
		? preprocessors
		: merge_preprocessors(preprocessors);

	for (const p of order) {
		let processed;

		if (p.markup) {
			processed = await process_markup(source, p.markup, filename);
			source = processed.source;
			if (processed.dependencies && processed.dependencies.length) {
				dependencies.push(...processed.dependencies);
			}
		}

		if (p.script) {
			processed = await process_script(source, p.script, filename);
			source = processed.source;
			if (processed.dependencies && processed.dependencies.length) {
				dependencies.push(...processed.dependencies);
			}
		}

		if (p.style) {
			processed = await process_style(source, p.style, filename);
			source = processed.source;
			if (processed.dependencies && processed.dependencies.length) {
				dependencies.push(...processed.dependencies);
			}
		}
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
