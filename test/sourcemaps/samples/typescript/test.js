export function test({ assert, input, preprocessed }) {
	const assertMapped = (source, transformed) => {
		const sourceLoc = input.locate(source);
		const transformedLoc = preprocessed.locate_1(transformed);
		assert.deepEqual(
			preprocessed.mapConsumer.originalPositionFor(transformedLoc),
			{
				source: 'input.svelte',
				name: null,
				line: sourceLoc.line + 1,
				column: sourceLoc.column
			},
			`failed to locate "${transformed}"`
		);
	};

	const assertNotMapped = (code) => {
		const transformedLoc = preprocessed.locate_1(code);
		assert.strictEqual(transformedLoc, undefined, `failed to remove "${code}"`);
	};

	// TS => JS code
	assertMapped('let count: number = 0;', 'let count = 0;');

	// Markup, not touched
	assertMapped('<h1>Hello world!</h1>', '<h1>Hello world!</h1>');

	// TS types, removed
	assertNotMapped('ITimeoutDestroyer');
}
