import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 198, column: 1, line: 13 },
			end: { character: 205, column: 8, line: 13 }
		}
	]
});
