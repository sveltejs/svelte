import { test } from '../../test';

export default test({
	logs: [
		'One or more `@migration-task` comments were added to `output.svelte`, please check them and complete the migration manually.'
	],
	errors: [
		'Error while migrating Svelte code',
		{
			code: 'unexpected_eof',
			end: {
				character: 30,
				column: 21,
				line: 3
			},
			filename: 'output.svelte',
			frame: `1: <script
2: 
3: unterminated template
                        ^`,
			message: 'Unexpected end of input',
			position: [30, 30],
			start: {
				character: 30,
				column: 21,
				line: 3
			}
		}
	]
});
