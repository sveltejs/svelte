export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":global(input) + span"',
			pos: 239,
			start: {
				character: 239,
				column: 2,
				line: 9
			},
			end: {
				character: 260,
				column: 23,
				line: 9
			},
			frame: `
				 7:   :global(input) ~ p { color: red; }
				 8:
				 9:   :global(input) + span { color: red; }
				      ^
				10:   :global(input) ~ span { color: red; }
				11: </style>
			`
		},
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":global(input) ~ span"',
			pos: 279,
			start: {
				character: 279,
				column: 2,
				line: 10
			},
			end: {
				character: 300,
				column: 23,
				line: 10
			},
			frame: `
				 8:
				 9:   :global(input) + span { color: red; }
				10:   :global(input) ~ span { color: red; }
				      ^
				11: </style>
				12:
			`
		}
	]
};
