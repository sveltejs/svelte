export function test({ assert, smcCss, locateInSource, locateInGeneratedCss }) {
	const expected = locateInSource( '.foo' );

	const start = locateInGeneratedCss( '.foo' );

	const actual = smcCss.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual( actual, {
		source: 'input.svelte',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});
}
