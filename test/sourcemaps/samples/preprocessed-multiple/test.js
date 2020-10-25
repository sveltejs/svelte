export function test({ assert, input, js, css }) {
	const expectedBar = input.locate('baritone');
	const expectedBaz = input.locate('--bazitone');

	let start = js.locate('bar');

	const actualbar = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: null,
		line: expectedBar.line + 1,
		column: expectedBar.column
	});

	start = css.locate('--baz');

	const actualbaz = css.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: null,
		line: expectedBaz.line + 1,
		column: expectedBaz.column
	}, `\
couldn't find baz in css,
 gen: ${JSON.stringify(start)}
 actual: ${JSON.stringify(actualbaz)}
 expected: ${JSON.stringify(expectedBaz)}\
`);
}
