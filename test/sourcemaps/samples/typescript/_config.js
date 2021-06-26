import * as ts from 'typescript';

export default {
	js_map_sources: [
		'input.svelte'
	],
	preprocess: [
		{
			script: ({ content, filename }) => {
				const { outputText, sourceMapText } = ts.transpileModule(content, {
					fileName: filename,
					compilerOptions: {
						target: ts.ScriptTarget.ES2015,
						module: ts.ModuleKind.ES2015,
						sourceMap: true
					}
				});

				return {
					code: outputText,
					map: sourceMapText
				};
			}
		}
	]
};
