export function test({ assert, smcCss, locateInSource, locateInGeneratedCss }) {
	const expectedBar = locateInSource('--baritone');
	const expectedBaz = locateInSource('--baz');
	
	let start = locateInGeneratedCss('--bar');

	const actualbar = smcCss.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: null,
		line: expectedBar.line + 1,
		column: expectedBar.column
	}, `couldn't find bar in source` );

	start = locateInGeneratedCss('--baz');

	const actualbaz = smcCss.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: null,
		line: expectedBaz.line + 1,
		column: expectedBaz.column
	}, `couldn't find baz in source` );
}
