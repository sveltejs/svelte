export function test({ assert, input, css }) {
	const expected = input.locate('.foo');

	const start = css.locate('.foo');

	const actual = css.mapConsumer.originalPositionFor({
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
