export default {
	data: {
		active: true
	},

	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		start: {
			column: 1,
			line: 12,
			character: 169
		},
		end: {
			column: 20,
			line: 12,
			character: 188
		},
		pos: 169,
		frame: `
			10:   }
			11:
			12:   ref:button.inactive {
			      ^
			13:     color: green;
			14:   }`
	}]
};