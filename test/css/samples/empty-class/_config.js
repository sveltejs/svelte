export default {
	cascade: false,

	warnings: [{
		filename: "SvelteComponent.html",
		message: "Unused CSS selector",
		loc: {
			line: 4,
			column: 1
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