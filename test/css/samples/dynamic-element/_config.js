export default {
	warnings: [
		{
			code: 'css-unused-selector',
			end: {
				character: 86,
				column: 8,
				line: 7
			},
			frame:
				' 5:     color: red;\n 6:   }\n 7:   .unused {\n      ^\n 8:     font-style: italic;\n 9:   }',
			message: 'Unused CSS selector ".unused"',
			pos: 79,
			start: {
				character: 79,
				column: 1,
				line: 7
			}
		}
	]
};
