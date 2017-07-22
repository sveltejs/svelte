export function test ({ assert, smcCss, locateInSource, locateInGeneratedCss }) {
	const expected = locateInSource( '.foo' );

	const loc = locateInGeneratedCss( '.foo' );

	const actual = smcCss.originalPositionFor({
		line: loc.line + 1,
		column: loc.column
	});

	assert.deepEqual( actual, {
		source: 'input.html',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});
}
