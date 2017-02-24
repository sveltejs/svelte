export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( '42' );
	const loc = locateInGenerated( '42' );

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
