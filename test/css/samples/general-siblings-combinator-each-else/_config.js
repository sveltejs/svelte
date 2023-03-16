export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				11:
				12:   /* no match */
				13:   .b ~ .c { color: green; }
				      ^
				14: </style>
				15:`,
			message: 'Unused CSS selector ".b ~ .c"',
			pos: 199,
			start: { character: 199, column: 1, line: 13 },
			end: { character: 206, column: 8, line: 13 }
		}
	]
};
