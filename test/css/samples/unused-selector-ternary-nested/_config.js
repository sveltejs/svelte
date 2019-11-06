export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector',
			frame: `
				13:   .thing.active {color: blue;}
				14:   .hover { color: blue; }
				15:   .hover.unused { color: blue; }
				      ^
				16:
				17:   .unused {color: blue;}`,
			start: { line: 15, column: 2, character: 261 },
			end: { line: 15, column: 15, character: 274 },
			pos: 261,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector',
			frame: `
				15:   .hover.unused { color: blue; }
				16:
				17:   .unused {color: blue;}
				      ^
				18: </style>`,
			start: { line: 17, column: 2, character: 295 },
			end: { line: 17, column: 9, character: 302 },
			pos: 295,
		},
	],
};
