export default {
	warnings: [{
		filename: 'SvelteComponent.svelte',
		code: 'css-unused-selector',
		message: 'Unused CSS selector ".x"',
		start: {
			line: 4,
			column: 1,
			character: 31
		},
		end: {
			line: 4,
			column: 3,
			character: 33
		},
		pos: 31,
		frame: `
			2:
			3: <style>
			4:   .x {
			     ^
			5:     color: red;
			6:   }`
	}]
};
