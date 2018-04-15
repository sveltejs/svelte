export default {
	cascade: false,

	data: {
		active: true
	},

	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		loc: {
			column: 1,
			line: 12
		},
		pos: 174,
		frame: `
			10:   }
			11:
			12:   ref:button.inactive {
			      ^
			13:     color: green;
			14:   }`
	}]
};