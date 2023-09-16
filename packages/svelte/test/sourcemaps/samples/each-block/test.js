export function test({ assert, input, js }) {
	const start_index = js.code.indexOf('create_main_fragment');

	const expected = input.locate('each');
	const start = js.locate('length', start_index);

	const actual = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actual, {
		source: 'input.svelte',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});
}
