import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".e ~ .f"',
			start: { character: 812, column: 1, line: 35 },
			end: { character: 819, column: 8, line: 35 }
		}
	]
});
