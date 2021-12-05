export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				10:
				11:   /* no match */
				12:   article ~ div { color: green; }
				      ^
				13:   span ~ article { color: green; }
				14:   b ~ article { color: green; }`,
			message: 'Unused CSS selector "article ~ div"',
			pos: 275,
			start: { character: 275, column: 1, line: 12 },
			end: { character: 288, column: 14, line: 12 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				11:   /* no match */
				12:   article ~ div { color: green; }
				13:   span ~ article { color: green; }
				      ^
				14:   b ~ article { color: green; }
				15:   span ~ div { color: green; }`,
			message: 'Unused CSS selector "span ~ article"',
			pos: 308,
			start: { character: 308, column: 1, line: 13 },
			end: { character: 322, column: 15, line: 13 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				12:   article ~ div { color: green; }
				13:   span ~ article { color: green; }
				14:   b ~ article { color: green; }
				      ^
				15:   span ~ div { color: green; }
				16: </style>`,
			message: 'Unused CSS selector "b ~ article"',
			pos: 342,
			start: { character: 342, column: 1, line: 14 },
			end: { character: 353, column: 12, line: 14 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				13:   span ~ article { color: green; }
				14:   b ~ article { color: green; }
				15:   span ~ div { color: green; }
				      ^
				16: </style>
				17:`,
			message: 'Unused CSS selector "span ~ div"',
			pos: 373,
			start: { character: 373, column: 1, line: 15 },
			end: { character: 383, column: 11, line: 15 }
		}
	]
};
