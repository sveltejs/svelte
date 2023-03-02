export function test({ assert, input, js }) {
	const startIndex = js.code.indexOf('create_main_fragment');

	const expected = input.locate('each');
	const start = js.locate('length', startIndex);

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
