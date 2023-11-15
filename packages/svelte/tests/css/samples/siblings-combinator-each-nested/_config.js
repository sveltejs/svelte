import { test } from '../../test';

export default test({
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .h"',
			start: { character: 1229, column: 1, line: 58 },
			end: { character: 1236, column: 8, line: 58 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".a + .i"',
			start: { character: 1256, column: 1, line: 59 },
			end: { character: 1263, column: 8, line: 59 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .h"',
			start: { character: 1283, column: 1, line: 60 },
			end: { character: 1290, column: 8, line: 60 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".c + .i"',
			start: { character: 1310, column: 1, line: 61 },
			end: { character: 1317, column: 8, line: 61 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".d + .f"',
			start: { character: 1337, column: 1, line: 62 },
			end: { character: 1344, column: 8, line: 62 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".d + .g"',
			start: { character: 1364, column: 1, line: 63 },
			end: { character: 1371, column: 8, line: 63 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".e + .g"',
			start: { character: 1391, column: 1, line: 64 },
			end: { character: 1398, column: 8, line: 64 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".g + .i"',
			start: { character: 1418, column: 1, line: 65 },
			end: { character: 1425, column: 8, line: 65 }
		}
	]
});
