export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				16:
				17:   /* no match */
				18:   .b + .c { color: green; }
				      ^
				19: </style>
				20:`,
			message: 'Unused CSS selector ".b + .c"',
			pos: 319,
			start: { character: 319, column: 1, line: 18 },
			end: { character: 326, column: 8, line: 18 }
		}
	]
};
