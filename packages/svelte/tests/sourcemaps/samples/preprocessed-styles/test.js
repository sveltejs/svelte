export function test({ assert, input, css }) {
	const expected_bar = input.locate('--baritone');
	const expected_baz = input.locate('--baz');

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
			line: expected_bar.line + 1,
			column: expected_bar.column
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
			line: expected_baz.line + 1,
			column: expected_baz.column
		},
		"couldn't find baz in source"
	);
}
