export default {
	warnings: [{
		filename: "SvelteComponent.html",
		code: `css-unused-selector`,
		message: "Unused CSS selector",
		loc: {
			line: 8,
			column: 1
		},
		pos: 60,
		frame: `
			 6:   }
			 7:
			 8:   .bar {
			      ^
			 9:     color: blue;
			10:   }`
	}]
};