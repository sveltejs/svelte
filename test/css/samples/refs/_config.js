export default {
	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		start: {
			column: 1,
			line: 14,
			character: 120
		},
		end: {
			column: 6,
			line: 14,
			character: 125
		},
		pos: 120,
		frame: `
			12:   }
			13:
			14:   ref:d {
			      ^
			15:     color: blue;
			16:   }`
	}]
};