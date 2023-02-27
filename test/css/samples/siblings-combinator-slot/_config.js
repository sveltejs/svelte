export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				 7:
				 8:   /* no match */
				 9:   .a + .b { color: green; }
				      ^
				10:   .b + .c { color: green; }
				11:   .c + .f { color: green; }`,
			message: 'Unused CSS selector ".a + .b"',
			pos: 84,
			start: { character: 84, column: 1, line: 9 },
			end: { character: 91, column: 8, line: 9 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				 8:   /* no match */
				 9:   .a + .b { color: green; }
				10:   .b + .c { color: green; }
				      ^
				11:   .c + .f { color: green; }
				12: </style>`,
			message: 'Unused CSS selector ".b + .c"',
			pos: 111,
			start: { character: 111, column: 1, line: 10 },
			end: { character: 118, column: 8, line: 10 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				 9:   .a + .b { color: green; }
				10:   .b + .c { color: green; }
				11:   .c + .f { color: green; }
				      ^
				12: </style>
				13:`,
			message: 'Unused CSS selector ".c + .f"',
			pos: 138,
			start: { character: 138, column: 1, line: 11 },
			end: { character: 145, column: 8, line: 11 }
		}
	]
};
