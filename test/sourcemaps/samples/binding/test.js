export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'bar.baz' );

	let start;
	let actual;

	start = locateInGenerated( 'bar.baz' );

	actual = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual( actual, {
		source: 'input.html',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});

	start = locateInGenerated( 'bar.baz', start.character + 1 );

	actual = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual( actual, {
		source: 'input.html',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});
}
