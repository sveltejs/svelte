export default {
	cascade: false,

	data: {
		active: true
	},

	warnings: [{
		filename: "SvelteComponent.html",
		code: `css-unused-selector`,
		message: "Unused CSS selector",
		loc: {
			line: 12,
			column: 1
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