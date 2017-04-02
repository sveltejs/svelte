export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'bar.baz' );

	let loc;
	let actual;

	loc = locateInGenerated( 'bar.baz' );

	actual = smc.originalPositionFor({
		line: loc.line + 1,
		column: loc.column
	});

	assert.deepEqual( actual, {
		source: 'input.html',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});

	loc = locateInGenerated( 'bar.baz', loc.character + 1 );

	actual = smc.originalPositionFor({
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
