export default {
	cascade: false,

	warnings: [{
		code: `css-unused-selector`,
		message: 'Unused CSS selector',
		loc: {
			line: 8,
			column: 1
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