export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				13:
				14:   /* no match */
				15:   .b ~ .c { color: green; }
				      ^
				16:   .c ~ .d { color: green; }
				17:   .b ~ .d { color: green; }`,
			message: 'Unused CSS selector ".b ~ .c"',
			pos: 269,
			start: { character: 269, column: 1, line: 15 },
			end: { character: 276, column: 8, line: 15 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				14:   /* no match */
				15:   .b ~ .c { color: green; }
				16:   .c ~ .d { color: green; }
				      ^
				17:   .b ~ .d { color: green; }
				18: </style>`,
			message: 'Unused CSS selector ".c ~ .d"',
			pos: 296,
			start: { character: 296, column: 1, line: 16 },
			end: { character: 303, column: 8, line: 16 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				15:   .b ~ .c { color: green; }
				16:   .c ~ .d { color: green; }
				17:   .b ~ .d { color: green; }
				      ^
				18: </style>
				19:`,
			message: 'Unused CSS selector ".b ~ .d"',
			pos: 323,
			start: { character: 323, column: 1, line: 17 },
			end: { character: 330, column: 8, line: 17 }
		}
	]
};
