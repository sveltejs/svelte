import * as ts from 'typescript';
import { test } from '../../test';

export default test({
	skip: true,
	js_map_sources: ['input.svelte'],
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
});
