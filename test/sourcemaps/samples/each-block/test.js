export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'each' );

	const loc = locateInGenerated( 'length' );

	const actual = smc.originalPositionFor({
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
