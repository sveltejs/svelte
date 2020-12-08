export function test({ assert, input, preprocessed }) {
	const content = '<h1>Hello world!</h1>';

	const original = input.locate(content);
	const transformed = preprocessed.locate_1('<h1>Hello world!</h1>');

	assert.deepEqual(
		preprocessed.mapConsumer.originalPositionFor(transformed),
		{
			source: 'input.svelte',
			name: null,
			line: original.line + 1,
			column: original.column
		},
		`failed to locate "${content}"`
	);
}
