export function test({ assert, smc, smcCss, locateInSource, locateInGenerated, locateInGeneratedCss }) {
	const expectedBar = locateInSource('baritone');
	const expectedBaz = locateInSource('--bazitone');
	
	let start = locateInGenerated('bar');

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
	}, `couldn't find baz in css,\n gen:${JSON.stringify(start)}\n actual:${JSON.stringify(actualbaz)}\n expected:${JSON.stringify(expectedBaz)}`);
}
