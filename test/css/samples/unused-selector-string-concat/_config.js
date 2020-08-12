export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".fooaa"',
			frame:
				` 9: <style>
				10:   .foo {color: red;}
				11:   .fooaa {color: red;}
				      ^
				12:   .foobb {color: red;}
				13:   .foocc {color: red;}`,
			start: { line: 11, column: 2, character: 206 },
			end: { line: 11, column: 8, character: 212 },
			pos: 206,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".foobb"',
			frame:
				`10:   .foo {color: red;}
				11:   .fooaa {color: red;}
				12:   .foobb {color: red;}
				      ^
				13:   .foocc {color: red;}
				14:   .foodd {color: red;}`,
			start: { line: 12, column: 2, character: 229 },
			end: { line: 12, column: 8, character: 235 },
			pos: 229,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".foodd"',
			frame:
				`12:   .foobb {color: red;}
				13:   .foocc {color: red;}
				14:   .foodd {color: red;}
				      ^
				15:   .aa {color: red;}
				16:   .bb {color: red;}`,
			start: { line: 14, column: 2, character: 275 },
			end: { line: 14, column: 8, character: 281 },
			pos: 275,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".bbbar"',
			frame:
				`18:   .dd {color: red;}
				19:   .aabar {color: red;}
				20:   .bbbar {color: red;}
				      ^
				21:   .ccbar {color: red;}
				22:   .ddbar {color: red;}`,
			start: { line: 20, column: 2, character: 401 },
			end: { line: 20, column: 8, character: 407 },
			pos: 401,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".ccbar"',
			frame:
				`19:   .aabar {color: red;}
				20:   .bbbar {color: red;}
				21:   .ccbar {color: red;}
				      ^
				22:   .ddbar {color: red;}
				23:   .fooaabar {color: red;}`,
			start: { line: 21, column: 2, character: 424 },
			end: { line: 21, column: 8, character: 430 },
			pos: 424,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".ddbar"',
			frame:
				`20:   .bbbar {color: red;}
				21:   .ccbar {color: red;}
				22:   .ddbar {color: red;}
				      ^
				23:   .fooaabar {color: red;}
				24:   .foobbbar {color: red;}`,
			start: { line: 22, column: 2, character: 447 },
			end: { line: 22, column: 8, character: 453 },
			pos: 447,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".fooaabar"',
			frame:
				`21:   .ccbar {color: red;}
				22:   .ddbar {color: red;}
				23:   .fooaabar {color: red;}
				      ^
				24:   .foobbbar {color: red;}
				25:   .fooccbar {color: red;}`,
			start: { line: 23, column: 2, character: 470 },
			end: { line: 23, column: 11, character: 479 },
			pos: 470,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".foobbbar"',
			frame:
				`22:   .ddbar {color: red;}
				23:   .fooaabar {color: red;}
				24:   .foobbbar {color: red;}
				      ^
				25:   .fooccbar {color: red;}
				26:   .fooddbar {color: red;}`,
			start: { line: 24, column: 2, character: 496 },
			end: { line: 24, column: 11, character: 505 },
			pos: 496,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".fooccbar"',
			frame:
				`23:   .fooaabar {color: red;}
				24:   .foobbbar {color: red;}
				25:   .fooccbar {color: red;}
				      ^
				26:   .fooddbar {color: red;}
				27:   .baz {color: red;}`,
			start: { line: 25, column: 2, character: 522 },
			end: { line: 25, column: 11, character: 531 },
			pos: 522,
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ".unused"',
			frame:
				`26:   .fooddbar {color: red;}
				27:   .baz {color: red;}
				28:   .unused {color: red;}
				      ^
				29: </style>`,
			start: { line: 28, column: 2, character: 595 },
			end: { line: 28, column: 9, character: 602 },
			pos: 595,
		},
	],
};
