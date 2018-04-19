export default {
	data: {
		active: true
	},

	warnings: [{
		filename: "SvelteComponent.html",
		code: `css-unused-selector`,
		message: "Unused CSS selector",
		start: {
			line: 12,
			column: 1,
			character: 123
		},
		end: {
			line: 12,
			column: 13,
			character: 135
		},
		pos: 123,
		frame: `
			10:   }
			11:
			12:   .maybeactive {
			      ^
			13:     color: green;
			14:   }`
	}]
};