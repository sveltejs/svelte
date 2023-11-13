import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".b ~ .c"',
			start: { character: 199, column: 1, line: 13 },
			end: { character: 206, column: 8, line: 13 }
		}
	]
});
