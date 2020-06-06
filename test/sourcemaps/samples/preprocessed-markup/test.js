export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expectedBar = locateInSource('baritone.baz');
	const expectedBaz = locateInSource('.baz');

	let start = locateInGenerated('bar.baz');

	const actualbar = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: null,
		line: expectedBar.line + 1,
		column: expectedBar.column
	});

	start = locateInGenerated('.baz');

	const actualbaz = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: null,
		line: expectedBaz.line + 1,
		column: expectedBaz.column
	});
}
