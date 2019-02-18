export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( '42' );
	const start = locateInGenerated( '42' );

	const actual = smc.originalPositionFor({
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
