export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'potato' );

	let loc;

	loc = locateInGenerated( 'potato' );
	loc = locateInGenerated( 'potato', loc.character + 1 );
	loc = locateInGenerated( 'potato', loc.character + 1 ); // we need the third instance of 'potato'

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
