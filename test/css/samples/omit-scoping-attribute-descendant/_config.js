export default {
	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector "div > p"',
		start: {
			line: 8,
			column: 1,
			character: 74
		},
		end: {
			line: 8,
			column: 8,
			character: 81
		},
		pos: 74,
		frame: `
			 6:
			 7: <style>
			 8:   div > p {
			      ^
			 9:     color: red;
			10:   }`
	}]
};