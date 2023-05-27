export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				12:
				13:   /* no match */
				14:   .b + .c { color: green; }
				      ^
				15: </style>
				16:`,
			message: 'Unused CSS selector ".b + .c"',
			pos: 215,
			start: { character: 215, column: 1, line: 14 },
			end: { character: 222, column: 8, line: 14 }
		}
	]
};
