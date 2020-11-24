export default {
	props: {
		active: true
	},

	warnings: [{
		filename: 'SvelteComponent.svelte',
		code: 'css-unused-selector',
		message: 'Unused CSS selector ".maybeactive"',
		start: {
			line: 16,
			column: 1,
			character: 163
		},
		end: {
			line: 16,
			column: 13,
			character: 175
		},
		pos: 163,
		frame: `
			14:   }
			15:
			16:   .maybeactive {
			      ^
			17:     color: green;
			18:   }`
	}]
};
