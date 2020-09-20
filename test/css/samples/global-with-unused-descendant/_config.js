export default {
	warnings: [{
		code: 'css-unused-selector',
		end: {
			character: 27,
			column: 19,
			line: 2
		},
		frame: `
			1: <style>
			2:   :global(.foo) .bar {
			     ^
			3:     color: red;
			4:   }
		`,
		message: 'Unused CSS selector',
		pos: 9,
		start: {
			character: 9,
			column: 1,
			line: 2
		}
	}]
};
