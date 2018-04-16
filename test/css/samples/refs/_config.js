export default {
	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		loc: {
			column: 1,
			line: 14
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