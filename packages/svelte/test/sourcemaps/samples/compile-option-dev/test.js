import { SourceMapConsumer } from 'source-map';

const b64dec = (s) => Buffer.from(s, 'base64').toString();

export async function test({ assert, css, js }) {
	// We check that the css source map embedded in the js is accurate
	const match = js.code.match(
		/\tappend_styles\(target, "svelte-.{6}", "(.*?)(?:\\n\/\*# sourceMappingURL=data:(.*?);charset=(.*?);base64,(.*?) \*\/)?"\);\n/
	);

	assert.notEqual(match, null);

	const [mime_type, encoding, css_map_base64] = match.slice(2);
	assert.equal(mime_type, 'application/json');
	assert.equal(encoding, 'utf-8');

	const css_map_json = b64dec(css_map_base64);
	css.mapConsumer = await new SourceMapConsumer(css_map_json);

	// TODO make util fn + move to test index.js
	const sourcefile = 'input.svelte';
	[
		// TODO: get line and col num from input.svelte rather than hardcoding here
		[css, '--keep-me', null, 13, 2],
		[css, '--done-replace-once', '--replace-me-once', 7, 2],
		[css, '--done-replace-twice', '--replace-me-twice', 10, 2]
	].forEach(([where, content, name, line, column]) => {
		assert.deepEqual(
			where.mapConsumer.originalPositionFor(where.locate_1(content)),
			{
				source: sourcefile,
				name,
				line,
				column
			},
			`failed to locate "${content}" from "${sourcefile}"`
		);
	});
}
