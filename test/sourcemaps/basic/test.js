export function test ({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource( 'foo.bar.baz' );
	const loc = locateInGenerated( 'foo.bar.baz' );

	const actual = smc.originalPositionFor({
		line: loc.line + 1,
		column: loc.column
	});

	assert.deepEqual( actual, {
		source: 'SvelteComponent.html',
		name: null,
		line: expected.line,
		column: expected.column
	});
}
