export function test({ assert, input, js }) {
	const expectedBar = input.locate('baritone:');
	const expectedBaz = input.locate('baz:');

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
			line: expectedBar.line + 1,
			column: expectedBar.column
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
			line: expectedBaz.line + 1,
			column: expectedBaz.column
		},
		"couldn't find baz: in source"
	);
}
