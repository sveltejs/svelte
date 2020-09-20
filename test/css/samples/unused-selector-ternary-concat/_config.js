export default {
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 205,
				column: 9,
				line: 14,
			},
			frame: `
				12:   .thing.active {color: blue;}
				13:
				14:   .unused {color: blue;}
				      ^
				15: </style>`,
			message: 'Unused CSS selector',
			pos: 198,
			start: {
				character: 198,
				column: 2,
				line: 14,
			},
		},
	],
};
