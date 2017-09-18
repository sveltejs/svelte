export function test({ assert, code, smc, locateInSource, locateInGenerated }) {
	const startIndex = code.indexOf('create_main_fragment');

	const expected = locateInSource('each');
	const loc = locateInGenerated('length', startIndex );

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
