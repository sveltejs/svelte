export function test({ assert, input, js, css }) {
	const expected_bar = input.locate('baritone');
	const expected_baz = input.locate('--bazitone');

	let start = js.locate('bar');

	const actualbar = js.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbar, {
		source: 'input.svelte',
		name: 'baritone',
		line: expected_bar.line + 1,
		column: expected_bar.column
	});

	start = css.locate('--baz');

	const actualbaz = css.mapConsumer.originalPositionFor({
		line: start.line + 1,
		column: start.column
	});

	assert.deepEqual(actualbaz, {
		source: 'input.svelte',
		name: '--bazitone',
		line: expected_baz.line + 1,
		column: expected_baz.column
	});
}
