import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".b + .c"',
			start: { character: 319, column: 1, line: 18 },
			end: { character: 326, column: 8, line: 18 }
		}
	]
});
