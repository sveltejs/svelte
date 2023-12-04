import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .d"',
			start: { character: 172, column: 1, line: 12 },
			end: { character: 179, column: 8, line: 12 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 199, column: 1, line: 13 },
			end: { character: 206, column: 8, line: 13 }
		}
	]
});
