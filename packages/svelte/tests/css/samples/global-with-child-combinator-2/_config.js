import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "a:global(.foo) > div"',
			start: { character: 91, column: 1, line: 8 },
			end: { character: 111, column: 21, line: 8 }
		}
	]
});
