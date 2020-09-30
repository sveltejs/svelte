export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				10:
				11:   /* no match */
				12:   .a + .d { color: green; }
				      ^
				13:   .b + .c { color: green; }
				14: </style>`,
			message: 'Unused CSS selector ".a + .d"',
			pos: 172,
			start: { character: 172, column: 1, line: 12 },
			end: { character: 179, column: 8, line: 12 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				11:   /* no match */
				12:   .a + .d { color: green; }
				13:   .b + .c { color: green; }
				      ^
				14: </style>
				15:`,
			message: 'Unused CSS selector ".b + .c"',
			pos: 199,
			start: { character: 199, column: 1, line: 13 },
			end: { character: 206, column: 8, line: 13 }
		}
	]
};
