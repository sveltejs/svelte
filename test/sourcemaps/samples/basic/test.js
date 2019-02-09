export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'foo.bar.baz' );

	let start;
	let actual;

	start = locateInGenerated( 'foo.bar.baz' );

	actual = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual( actual, {
		source: 'input.svelte',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});

	start = locateInGenerated( 'foo.bar.baz', start.character + 1 );

	actual = smc.originalPositionFor({
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
