export default {
	warnings: [
		{
			code: 'css-unused-selector',
			frame: `
				3:     margin-left: 4px;
				4:   }
				5:   .not-match > * ~ * {
				     ^
				6:     margin-left: 4px;
				7:   }`,
			message: 'Unused CSS selector ".not-match > * ~ *"',
			pos: 50,
			start: { character: 50, column: 1, line: 5 },
      end: { character: 68, column: 19, line: 5 }
		}
	]
};
