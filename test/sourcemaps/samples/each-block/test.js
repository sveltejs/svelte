export function test({ assert, code, smc, locateInSource, locateInGenerated }) {
	const startIndex = code.indexOf('create_main_fragment');

	const expected = locateInSource('each');
	const start = locateInGenerated('length', startIndex );

	const actual = smc.originalPositionFor({
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
