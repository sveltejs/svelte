import { SourceMap } from 'magic-string';
import { SourceMapConsumer, SourceMapGenerator } from 'source-map';

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

function addMappings(generator: SourceMapConsumer, map: string | object) {
	const consumer = new SourceMapConsumer(map);
	consumer.eachMapping(mapping => {
		generator.addMapping({
			source: mapping.source,
			name: mapping.name,
			original: {
				line: mapping.originalLine,
				column: mapping.originalColumn
			},
			generated: {
				line: mapping.generatedLine,
				column: mapping.generatedColumn
			}
		});
	});
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
			const code = (
				source.slice(0, match.index) +
				`<${type}>${processed.code}</${type}>` +
				source.slice(match.index + match[0].length)
			);

			// Shift sourcemap to the appropriate line
			if (processed.map) {
				const consumer = new SourceMapConsumer(processed.map);

				// Line number of the match
				let line = 0;
				for(let i = 0; i <= match.index; i = source.indexOf('\n', i + 1)) {
					line++;
				}

				// Skip the <tag ...>
				line++;

				const generator = new SourceMapGenerator({ file: options.filename })
				consumer.eachMapping(mapping => {
					generator.addMapping({
					  source: mapping.source,
						name: mapping.name,
					  original: {
							line: mapping.originalLine + line,
							column: mapping.originalColumn
						},
					  generated: {
							line: mapping.generatedLine + line,
							column: mapping.generatedColumn
						}
					});
				});

				return { code, map: generator.toJSON() };
			}

			return { code };
		}
	}

	return { code: source };
}

export default async function preprocess(
	source: string,
	options: PreprocessOptions
) {
	const { markup, style, script } = options;


	let markupMap: SourceMapGenerator;

	if (!!markup) {
		const processed: {
			code: string,
			map?: SourceMap | string
		} = await markup({
			content: source,
			filename: options.filename
		});

		source = processed.code;
		if (processed.map) {
			markupMap = SourceMapGenerator.fromSourceMap(new SourceMapConsumer(processed.map));
		}
	}

	let allMaps = new SourceMapGenerator({ file: options.filename });

	if (!!style) {
		const { code, map } = await replaceTagContents(source, 'style', style, options);
		source = code;
		if (map) {
			addMappings(allMaps, map);
		}
	}

	if (!!script) {
		const { code, map } = await replaceTagContents(source, 'script', script, options);
		source = code;
		if (map) {
			addMappings(allMaps, map);
		}
	}

	if (markupMap) {
		markupMap.applySourceMap(new SourceMapConsumer(allMaps.toString()));
		allMaps = markupMap;
	}

	return {
		// TODO return separated output, in future version where svelte.compile supports it:
		// style: { code: styleCode, map: styleMap },
		// script { code: scriptCode, map: scriptMap },
		// markup { code: markupCode, map: markupMap },

		toString() {
			return source;
		},

		getMap() {
			return allMaps.toJSON();
		}
	};
}