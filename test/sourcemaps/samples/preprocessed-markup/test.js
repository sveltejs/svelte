export function test({ assert, input, js }) {
	const expectedBar = input.locate('baritone.baz');
	const expectedBaz = input.locate('.baz');

	let start = js.locate('bar.baz');

	const actualbar = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: 'baritone',
		line: expectedBar.line + 1,
		column: expectedBar.column
	});

	start = js.locate('.baz');

	const actualbaz = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: null,
		line: expectedBaz.line + 1,
		column: expectedBaz.column
	});
}
