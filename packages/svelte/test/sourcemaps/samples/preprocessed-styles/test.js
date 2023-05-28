export function test({ assert, input, css }) {
	const expectedBar = input.locate('--baritone');
	const expectedBaz = input.locate('--baz');

	let start = css.locate('--bar');

	const actualbar = css.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(
		actualbar,
		{
			source: 'input.svelte',
			name: null,
			line: expectedBar.line + 1,
			column: expectedBar.column
		},
		"couldn't find bar in source"
	);

	start = css.locate('--baz');

	const actualbaz = css.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(
		actualbaz,
		{
			source: 'input.svelte',
			name: null,
			line: expectedBaz.line + 1,
			column: expectedBaz.column
		},
		"couldn't find baz in source"
	);
}
