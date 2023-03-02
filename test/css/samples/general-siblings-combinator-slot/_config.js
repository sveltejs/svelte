export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				 8:
				 9:   /* no match */
				10:   .a ~ .b { color: green; }
				      ^
				11:   .b ~ .c { color: green; }
				12:   .c ~ .f { color: green; }`,
			message: 'Unused CSS selector ".a ~ .b"',
			pos: 111,
			start: { character: 111, column: 1, line: 10 },
			end: { character: 118, column: 8, line: 10 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				 9:   /* no match */
				10:   .a ~ .b { color: green; }
				11:   .b ~ .c { color: green; }
				      ^
				12:   .c ~ .f { color: green; }
				13:   .f ~ .g { color: green; }`,
			message: 'Unused CSS selector ".b ~ .c"',
			pos: 138,
			start: { character: 138, column: 1, line: 11 },
			end: { character: 145, column: 8, line: 11 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				10:   .a ~ .b { color: green; }
				11:   .b ~ .c { color: green; }
				12:   .c ~ .f { color: green; }
				      ^
				13:   .f ~ .g { color: green; }
				14:   .b ~ .f { color: green; }`,
			message: 'Unused CSS selector ".c ~ .f"',
			pos: 165,
			start: { character: 165, column: 1, line: 12 },
			end: { character: 172, column: 8, line: 12 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				11:   .b ~ .c { color: green; }
				12:   .c ~ .f { color: green; }
				13:   .f ~ .g { color: green; }
				      ^
				14:   .b ~ .f { color: green; }
				15:   .b ~ .g { color: green; }`,
			message: 'Unused CSS selector ".f ~ .g"',
			pos: 192,
			start: { character: 192, column: 1, line: 13 },
			end: { character: 199, column: 8, line: 13 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				12:   .c ~ .f { color: green; }
				13:   .f ~ .g { color: green; }
				14:   .b ~ .f { color: green; }
				      ^
				15:   .b ~ .g { color: green; }
				16: </style>`,
			message: 'Unused CSS selector ".b ~ .f"',
			pos: 219,
			start: { character: 219, column: 1, line: 14 },
			end: { character: 226, column: 8, line: 14 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				13:   .f ~ .g { color: green; }
				14:   .b ~ .f { color: green; }
				15:   .b ~ .g { color: green; }
				      ^
				16: </style>
				17:`,
			message: 'Unused CSS selector ".b ~ .g"',
			pos: 246,
			start: { character: 246, column: 1, line: 15 },
			end: { character: 253, column: 8, line: 15 }
		}
	]
};
