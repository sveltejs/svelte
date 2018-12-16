export default {
	props: {
		active: true
	},

	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		start: {
			column: 1,
			line: 17,
			character: 222
		},
		end: {
			column: 20,
			line: 17,
			character: 241
		},
		pos: 222,
		frame: `
			15:   }
			16:
			17:   ref:button.inactive {
			      ^
			18:     color: green;
			19:   }`
	}]
};