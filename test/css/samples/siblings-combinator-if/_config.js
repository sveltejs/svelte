export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				13:
				14:   /* no match */
				15:   .a + .e { color: green; }
				      ^
				16:   .b + .c { color: green; }
				17:   .b + .d { color: green; }`,
			message: 'Unused CSS selector ".a + .e"',
			pos: 242,
			start: { character: 242, column: 1, line: 15 },
			end: { character: 249, column: 8, line: 15 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				14:   /* no match */
				15:   .a + .e { color: green; }
				16:   .b + .c { color: green; }
				      ^
				17:   .b + .d { color: green; }
				18:   .c + .d { color: green; }`,
			message: 'Unused CSS selector ".b + .c"',
			pos: 269,
			start: { character: 269, column: 1, line: 16 },
			end: { character: 276, column: 8, line: 16 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				15:   .a + .e { color: green; }
				16:   .b + .c { color: green; }
				17:   .b + .d { color: green; }
				      ^
				18:   .c + .d { color: green; }
				19: </style>`,
			message: 'Unused CSS selector ".b + .d"',
			pos: 296,
			start: { character: 296, column: 1, line: 17 },
			end: { character: 303, column: 8, line: 17 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				16:   .b + .c { color: green; }
				17:   .b + .d { color: green; }
				18:   .c + .d { color: green; }
				      ^
				19: </style>
				20:`,
			message: 'Unused CSS selector ".c + .d"',
			pos: 323,
			start: { character: 323, column: 1, line: 18 },
			end: { character: 330, column: 8, line: 18 }
		}
	]
};
