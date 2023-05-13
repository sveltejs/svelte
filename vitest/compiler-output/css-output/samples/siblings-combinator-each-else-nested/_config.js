export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				21:
				22:   /* no match */
				23:   .a + .c { color: green; }
				      ^
				24:   .a + .g { color: green; }
				25:   .b + .e { color: green; }`,
			message: 'Unused CSS selector ".a + .c"',
			pos: 479,
			start: { character: 479, column: 1, line: 23 },
			end: { character: 486, column: 8, line: 23 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				22:   /* no match */
				23:   .a + .c { color: green; }
				24:   .a + .g { color: green; }
				      ^
				25:   .b + .e { color: green; }
				26:   .c + .g { color: green; }`,
			message: 'Unused CSS selector ".a + .g"',
			pos: 506,
			start: { character: 506, column: 1, line: 24 },
			end: { character: 513, column: 8, line: 24 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				23:   .a + .c { color: green; }
				24:   .a + .g { color: green; }
				25:   .b + .e { color: green; }
				      ^
				26:   .c + .g { color: green; }
				27:   .c + .k { color: green; }`,
			message: 'Unused CSS selector ".b + .e"',
			pos: 533,
			start: { character: 533, column: 1, line: 25 },
			end: { character: 540, column: 8, line: 25 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				24:   .a + .g { color: green; }
				25:   .b + .e { color: green; }
				26:   .c + .g { color: green; }
				      ^
				27:   .c + .k { color: green; }
				28:   .d + .d { color: green; }`,
			message: 'Unused CSS selector ".c + .g"',
			pos: 560,
			start: { character: 560, column: 1, line: 26 },
			end: { character: 567, column: 8, line: 26 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				25:   .b + .e { color: green; }
				26:   .c + .g { color: green; }
				27:   .c + .k { color: green; }
				      ^
				28:   .d + .d { color: green; }
				29:   .e + .f { color: green; }`,
			message: 'Unused CSS selector ".c + .k"',
			pos: 587,
			start: { character: 587, column: 1, line: 27 },
			end: { character: 594, column: 8, line: 27 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				26:   .c + .g { color: green; }
				27:   .c + .k { color: green; }
				28:   .d + .d { color: green; }
				      ^
				29:   .e + .f { color: green; }
				30:   .f + .f { color: green; }`,
			message: 'Unused CSS selector ".d + .d"',
			pos: 614,
			start: { character: 614, column: 1, line: 28 },
			end: { character: 621, column: 8, line: 28 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				27:   .c + .k { color: green; }
				28:   .d + .d { color: green; }
				29:   .e + .f { color: green; }
				      ^
				30:   .f + .f { color: green; }
				31:   .g + .j { color: green; }`,
			message: 'Unused CSS selector ".e + .f"',
			pos: 641,
			start: { character: 641, column: 1, line: 29 },
			end: { character: 648, column: 8, line: 29 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				28:   .d + .d { color: green; }
				29:   .e + .f { color: green; }
				30:   .f + .f { color: green; }
				      ^
				31:   .g + .j { color: green; }
				32:   .g + .h + .i + .j { color: green; }`,
			message: 'Unused CSS selector ".f + .f"',
			pos: 668,
			start: { character: 668, column: 1, line: 30 },
			end: { character: 675, column: 8, line: 30 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				29:   .e + .f { color: green; }
				30:   .f + .f { color: green; }
				31:   .g + .j { color: green; }
				      ^
				32:   .g + .h + .i + .j { color: green; }
				33: </style>`,
			message: 'Unused CSS selector ".g + .j"',
			pos: 695,
			start: { character: 695, column: 1, line: 31 },
			end: { character: 702, column: 8, line: 31 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				30:   .f + .f { color: green; }
				31:   .g + .j { color: green; }
				32:   .g + .h + .i + .j { color: green; }
				      ^
				33: </style>
				34:`,
			message: 'Unused CSS selector ".g + .h + .i + .j"',
			pos: 722,
			start: { character: 722, column: 1, line: 32 },
			end: { character: 739, column: 18, line: 32 }
		}
	]
};
