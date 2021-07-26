export default {
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 111,
				column: 21,
				line: 8
			},
			frame: `
			 6:     color: red;
			 7:   }
			 8:   a:global(.foo) > div {
			      ^
			 9:     color: red;
			10:   }
			`,
			message: 'Unused CSS selector "a:global(.foo) > div"',
			pos: 91,
			start: {
				character: 91,
				column: 1,
				line: 8
			}
		}
	]
};
