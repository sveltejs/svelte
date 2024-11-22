import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".a + .c"',
			start: { character: 166, column: 1, line: 14 },
			end: { character: 173, column: 8, line: 14 }
		}
	]
});
