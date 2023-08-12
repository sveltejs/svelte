export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				3:     color: green;
				4:   }
				5:   article + div {
				     ^
				6:     color: green;
				7:   }`,
			message: 'Unused CSS selector "article + div"',
			pos: 45,
			start: { character: 45, column: 1, line: 5 },
			end: { character: 58, column: 14, line: 5 }
		},
		{
			code: 'css-unused-selector',

			frame: `
				 6:     color: green;
				 7:   }
				 8:   span + article {
				      ^
				 9:     color: green;
				10:   }`,
			message: 'Unused CSS selector "span + article"',
			pos: 81,
			start: { character: 81, column: 1, line: 8 },
			end: { character: 95, column: 15, line: 8 }
		},
		{
			code: 'css-unused-selector',

			frame: `
				 9:     color: green;
				10:   }
				11:   b + article {
				      ^
				12:     color: green;
				13:   }`,
			message: 'Unused CSS selector "b + article"',
			pos: 118,
			start: { character: 118, column: 1, line: 11 },
			end: { character: 129, column: 12, line: 11 }
		},
		{
			code: 'css-unused-selector',
			frame: `
				12:     color: green;
				13:   }
				14:   span + div {
				      ^
				15:     color: green;
				16:   }`,
			message: 'Unused CSS selector "span + div"',
			pos: 152,
			start: { character: 152, column: 1, line: 14 },
			end: { character: 162, column: 11, line: 14 }
		}
	]
};
