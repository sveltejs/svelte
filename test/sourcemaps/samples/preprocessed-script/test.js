export function test({ assert, smc, locateInSource, locateInGenerated }) {
	const expectedBar = locateInSource('baritone:');
	const expectedBaz = locateInSource('baz:');

	let start = locateInGenerated('bar:');

	const actualbar = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: null,
		line: expectedBar.line + 1,
		column: expectedBar.column
	}, `couldn't find bar: in source` );

	start = locateInGenerated('baz:');

	const actualbaz = smc.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: null,
		line: expectedBaz.line + 1,
		column: expectedBaz.column
	}, `couldn't find baz: in source` );
}
