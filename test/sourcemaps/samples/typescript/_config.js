import * as ts from 'typescript';

const tsCompilerOptions = {
	target: ts.ScriptTarget.ES2015,
	module: ts.ModuleKind.ES2015,
	sourceMap: true
};

export default {
	js_map_sources: [
		'input.svelte'
	],
	preprocess: [
		{
			script: ({ content, filename }) => {
				const { outputText, sourceMapText } = ts.transpileModule(content, {
					fileName: filename,
					compilerOptions: tsCompilerOptions
				});

				return {
					code: outputText,
					map: sourceMapText
				};
			},
			expression: ({ content, filename }) => {
				const { outputText, sourceMapText } = ts.transpileModule(content, {
					fileName: filename,
					compilerOptions: tsCompilerOptions
				});

				return {
					code: outputText.replace(/;([\s]+\/\/# sourceMappingURL=[\S]+)$/, '$1'),
					map: sourceMapText
				};
			}
		}
	]
};
