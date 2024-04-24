import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css_unused_selector',
			message: 'Unused CSS selector ".not-match > * + *"',
			start: { character: 50, column: 1, line: 5 },
			end: { character: 68, column: 19, line: 5 }
		}
	]
});
