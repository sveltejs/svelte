export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				24:   }
				25:   /* not match */
				26:   .a + .c {
				      ^
				27:     color: green;
				28:   }`,
			message: 'Unused CSS selector ".a + .c"',
			pos: 320,
			start: { character: 320, column: 1, line: 26 },
			end: { character: 327, column: 8, line: 26 }
		}
	]
};
