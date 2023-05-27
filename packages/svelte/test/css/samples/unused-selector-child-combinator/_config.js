export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "article > *"',
			frame: `
			1: <style>
			2:   article > * {
			     ^
			3:     font-size: 36px;
			4:   }`,
			pos: 10,
			start: { character: 10, column: 1, line: 2 },
			end: { character: 21, column: 12, line: 2 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector "article *"',
			frame: `
			4:   }
			5:
			6:   article * {
			     ^
			7:     font-size: 36px;
			8:   }`,
			pos: 49,
			start: { character: 49, column: 1, line: 6 },
			end: { character: 58, column: 10, line: 6 }
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".article > *"',
			frame: `
			 8:   }
			 9:
			10:   .article > * {
			      ^
			11:     font-size: 48px;
			12:   }`,
			pos: 86,
			start: { character: 86, column: 1, line: 10 },
			end: { character: 98, column: 13, line: 10 }
		}
	]
};
