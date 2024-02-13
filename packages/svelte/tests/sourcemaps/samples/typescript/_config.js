import * as ts from 'typescript';
import { test } from '../../test';

export default test({
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
	],
	client: ['count', 'setInterval'],
	preprocessed: [
		{ str: 'let count: number = 0;', strGenerated: 'let count = 0;' },
		{ str: 'ITimeoutDestroyer', strGenerated: null },
		'<h1>Hello world!</h1>'
	]
});
