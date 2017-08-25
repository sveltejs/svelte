export default {
	cascade: false,

	warnings: [
		{
			filename: "SvelteComponent.html",
			message: "Unused CSS selector",
			loc: {
				line: 4,
				column: 1
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
			filename: "SvelteComponent.html",
			message: "Unused CSS selector",
			loc: {
				line: 4,
				column: 13
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