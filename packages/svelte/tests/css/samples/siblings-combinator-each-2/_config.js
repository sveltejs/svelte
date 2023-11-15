import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .c"',
			start: { character: 320, column: 1, line: 26 },
			end: { character: 327, column: 8, line: 26 }
		}
	]
});
