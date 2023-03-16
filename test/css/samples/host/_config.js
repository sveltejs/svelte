export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":host > span"',
			pos: 147,
			start: {
				character: 147,
				column: 1,
				line: 18
			},
			end: {
				character: 159,
				column: 13,
				line: 18
			},
			frame: `
			16:   }
			17:
			18:   :host > span {
			      ^
			19:     color: red;
			20:   }
      `
		}
	]
};
