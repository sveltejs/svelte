export function test({ assert, input, js }) {
	const expected = input.locate('assertThisLine');
	const start = js.locate('assertThisLine');

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
