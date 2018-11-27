export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expected = locateInSource('potato');

	let start;

	start = locateInGenerated('potato');
	start = locateInGenerated('potato', start.character + 1);
	start = locateInGenerated('potato', start.character + 1); // we need the third instance of 'potato'

	const actual = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actual, {
		source: 'input.html',
		name: null,
		line: expected.line + 1,
		column: expected.column
	});
}
