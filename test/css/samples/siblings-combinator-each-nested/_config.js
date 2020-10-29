export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				56:
				57:   /* no match */
				58:   .a + .h { color: green; }
				      ^
				59:   .a + .i { color: green; }
				60:   .c + .h { color: green; }`,
			message: 'Unused CSS selector ".a + .h"',
			pos: 1229,
			start: { character: 1229, column: 1, line: 58 },
			end: { character: 1236, column: 8, line: 58 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				57:   /* no match */
				58:   .a + .h { color: green; }
				59:   .a + .i { color: green; }
				      ^
				60:   .c + .h { color: green; }
				61:   .c + .i { color: green; }`,
			message: 'Unused CSS selector ".a + .i"',
			pos: 1256,
			start: { character: 1256, column: 1, line: 59 },
			end: { character: 1263, column: 8, line: 59 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				58:   .a + .h { color: green; }
				59:   .a + .i { color: green; }
				60:   .c + .h { color: green; }
				      ^
				61:   .c + .i { color: green; }
				62:   .d + .f { color: green; }`,
			message: 'Unused CSS selector ".c + .h"',
			pos: 1283,
			start: { character: 1283, column: 1, line: 60 },
			end: { character: 1290, column: 8, line: 60 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				59:   .a + .i { color: green; }
				60:   .c + .h { color: green; }
				61:   .c + .i { color: green; }
				      ^
				62:   .d + .f { color: green; }
				63:   .d + .g { color: green; }`,
			message: 'Unused CSS selector ".c + .i"',
			pos: 1310,
			start: { character: 1310, column: 1, line: 61 },
			end: { character: 1317, column: 8, line: 61 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				60:   .c + .h { color: green; }
				61:   .c + .i { color: green; }
				62:   .d + .f { color: green; }
				      ^
				63:   .d + .g { color: green; }
				64:   .e + .g { color: green; }`,
			message: 'Unused CSS selector ".d + .f"',
			pos: 1337,
			start: { character: 1337, column: 1, line: 62 },
			end: { character: 1344, column: 8, line: 62 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				61:   .c + .i { color: green; }
				62:   .d + .f { color: green; }
				63:   .d + .g { color: green; }
				      ^
				64:   .e + .g { color: green; }
				65:   .g + .i { color: green; }`,
			message: 'Unused CSS selector ".d + .g"',
			pos: 1364,
			start: { character: 1364, column: 1, line: 63 },
			end: { character: 1371, column: 8, line: 63 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				62:   .d + .f { color: green; }
				63:   .d + .g { color: green; }
				64:   .e + .g { color: green; }
				      ^
				65:   .g + .i { color: green; }
				66: </style>`,
			message: 'Unused CSS selector ".e + .g"',
			pos: 1391,
			start: { character: 1391, column: 1, line: 64 },
			end: { character: 1398, column: 8, line: 64 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				63:   .d + .g { color: green; }
				64:   .e + .g { color: green; }
				65:   .g + .i { color: green; }
				      ^
				66: </style>
				67:`,
			message: 'Unused CSS selector ".g + .i"',
			pos: 1418,
			start: { character: 1418, column: 1, line: 65 },
			end: { character: 1425, column: 8, line: 65 }
		}
	]
};
