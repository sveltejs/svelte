export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				16:   }
				17:
				18:   .bar:global(.foo) {
				      ^
				19:     color: blue;
				20:   }
				`,
			message: 'Unused CSS selector ".bar:global(.foo)"',
			pos: 210,
			start: {
				character: 210,
				column: 1,
				line: 18
			},
			end: {
				character: 227,
				column: 18,
				line: 18
			}
		}
	]
};
