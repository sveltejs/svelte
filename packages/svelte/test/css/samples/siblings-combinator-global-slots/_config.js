export default {
	warnings: [
		{
			code: 'css-unused-selector',
			message: 'Unused CSS selector ":global(input) ~ p"',
			pos: 160,
			start: {
				character: 160,
				column: 1,
				line: 11
			},
			end: {
				character: 178,
				column: 19,
				line: 11
			},
			frame: ` 9:   :global(input) ~ span { color: red; }
				10:   /* no match */
				11:   :global(input) ~ p { color: red; }
				      ^
				12: </style>
	 `
		}
	]
};
