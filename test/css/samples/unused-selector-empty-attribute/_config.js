export default {
	warnings: [
		{
			filename: 'SvelteComponent.svelte',
			code: 'css-unused-selector',
			message: 'Unused CSS selector "img[alt=""]"',
			start: {
				character: 87,
				column: 1,
				line: 8
			},
			end: {
				character: 98,
				column: 12,
				line: 8
			},
			pos: 87,
			frame: `
			 6:   }
			 7:
			 8:   img[alt=""] {
			      ^
			 9:     border: 1px solid red;
			10:   }`
		}
	]
};
