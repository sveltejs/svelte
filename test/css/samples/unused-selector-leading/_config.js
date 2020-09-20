export default {
	warnings: [
		{
			filename: "SvelteComponent.svelte",
			code: `css-unused-selector`,
			message: "Unused CSS selector",
			start: {
				line: 4,
				column: 1,
				character: 34
			},
			end: {
				line: 4,
				column: 5,
				character: 38
			},
			pos: 34,
			frame: `
				2:
				3: <style>
				4:   .foo, .bar, .baz {
				     ^
				5:     color: red;
				6:   }`
		},

		{
			filename: "SvelteComponent.svelte",
			code: `css-unused-selector`,
			message: "Unused CSS selector",
			start: {
				line: 4,
				column: 13,
				character: 46
			},
			end: {
				line: 4,
				column: 17,
				character: 50
			},
			pos: 46,
			frame: `
				2:
				3: <style>
				4:   .foo, .bar, .baz {
				                 ^
				5:     color: red;
				6:   }`
		}
	]
};