export function test({ assert, input, js }) {
	const expected = input.locate('foo.bar.baz');

	let start;
	let actual;

	start = js.locate('ctx[0].bar.baz');

	actual = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actual, {
		source: 'input.svelte',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});

	start = js.locate('ctx[0].bar.baz', start.character + 1);

	actual = js.mapConsumer.originalPositionFor({
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
