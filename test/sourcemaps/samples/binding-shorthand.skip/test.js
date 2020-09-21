export function test({ assert, input, js }) {
	const expected = input.locate('potato');

	let start;

	start = js.locate('potato');
	start = js.locate('potato', start.character + 1);
	start = js.locate('potato', start.character + 1);
	// we need the third instance of 'potato'

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
