export default {
	warnings: [{
		filename: "SvelteComponent.svelte",
		code: `css-unused-selector`,
		message: "Unused CSS selector",
		start: {
			line: 12,
			column: 1,
			character: 110
		},
		end: {
			line: 12,
			column: 5,
			character: 114
		},
		pos: 110,
		frame: `
			10:   }
			11:
			12:   .bar {
			      ^
			13:     color: blue;
			14:   }`
	}]
};
