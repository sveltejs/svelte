export function test({ assert, input, js }) {
	const expected_bar = input.locate('baritone:');
	const expected_baz = input.locate('baz:');

	let start = js.locate('bar:');

	const actualbar = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(
		actualbar,
		{
			source: 'input.svelte',
			name: 'baritone',
			line: expected_bar.line + 1,
			column: expected_bar.column
		},
		"couldn't find bar: in source"
	);

	start = js.locate('baz:');

	const actualbaz = js.mapConsumer.originalPositionFor({
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
		"couldn't find baz: in source"
	);
}
