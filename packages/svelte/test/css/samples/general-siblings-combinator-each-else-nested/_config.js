export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				33:
				34:   /* no match */
				35:   .e ~ .f { color: green; }
				      ^
				36: </style>
				37:`,
			message: 'Unused CSS selector ".e ~ .f"',
			pos: 812,
			start: { character: 812, column: 1, line: 35 },
			end: { character: 819, column: 8, line: 35 }
		}
	]
};
