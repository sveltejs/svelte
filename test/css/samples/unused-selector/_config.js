export default {
	warnings: [{
		filename: 'SvelteComponent.svelte',
		code: 'css-unused-selector',
		message: 'Unused CSS selector ".bar"',
		start: {
			line: 8,
			column: 1,
			character: 60
		},
		end: {
			line: 8,
			column: 5,
			character: 64
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
