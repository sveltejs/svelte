export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'foo.bar.baz' );

	const start = locateInGenerated('foo.bar.baz');

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
