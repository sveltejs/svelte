export default {
	warnings: [
		{
			code: "css-unused-selector",
			frame: `
				17:
				18:   /* no match */
				19:   article ~ div {
				      ^
				20:     color: green;
				21:   }`,
			message: 'Unused CSS selector "article ~ div"',
			pos: 194,
			start: { character: 194, column: 1, line: 19 },
			end: { character: 207, column: 14, line: 19 }
		},
		{
			code: "css-unused-selector",
			frame: `
				20:     color: green;
				21:   }
				22:   span ~ article {
				      ^
				23:     color: green;
				24:   }`,
			message: 'Unused CSS selector "span ~ article"',
			pos: 230,
			start: { character: 230, column: 1, line: 22 },
			end: { character: 244, column: 15, line: 22 }
		},
		{
			code: "css-unused-selector",
			frame: `
				23:     color: green;
				24:   }
				25:   b ~ article {
				      ^
				26:     color: green;
				27:   }`,
			message: 'Unused CSS selector "b ~ article"',
			pos: 267,
			start: { character: 267, column: 1, line: 25 },
			end: { character: 278, column: 12, line: 25 }
		},
		{
			code: "css-unused-selector",
			frame: `
				26:     color: green;
				27:   }
				28:   span ~ div {
				      ^
				29:     color: green;
				30:   }`,
			message: 'Unused CSS selector "span ~ div"',
			pos: 301,
			start: { character: 301, column: 1, line: 28 },
			end: { character: 311, column: 11, line: 28 }
		}
	]
};
