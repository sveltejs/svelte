import MagicString from 'magic-string';
import { test } from '../../test';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';

export default test({
	skip: true, // TODO inline CSS map
	compileOptions: {
		dev: true
	},
	preprocess: [
		{
			style: ({ content, filename = '' }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, '--replace-me-once', '\n --done-replace-once');
				magic_string_replace_all(src, '--replace-me-twice', '\n--almost-done-replace-twice');
				return magic_string_preprocessor_result(filename, src);
			}
		},
		{
			style: ({ content, filename = '' }) => {
				const src = new MagicString(content);
				magic_string_replace_all(src, '--almost-done-replace-twice', '\n  --done-replace-twice');
				return magic_string_preprocessor_result(filename, src);
			}
		}
	],
	css: [
		'--keep-me: blue',
		{ str: '--replace-me-once: red', strGenerated: ' --done-replace-once: red' },
		{ str: '--replace-me-twice: green', strGenerated: '  --done-replace-twice: green' }
	],
	async test({ assert, code_client }) {
		// We check that the css source map embedded in the js is accurate
		const match = code_client.match(
			/\tappend_styles\(target, "svelte-.{6}", "(.*?)(?:\\n\/\*# sourceMappingURL=data:(.*?);charset=(.*?);base64,(.*?) \*\/)?"\);\n/
		);

		assert.notEqual(match, null);

		const [mime_type, encoding, css_map_base64] = match.slice(2);
		assert.equal(mime_type, 'application/json');
		assert.equal(encoding, 'utf-8');

		// TODO the idea is to check that the css source map is accurate; maybe do that instead by comparing with the one saved to disk?
		const css_map_json = Buffer.from(css_map_base64, 'base64').toString();
		css.mapConsumer = await new SourceMapConsumer(css_map_json);
		// TODO make util fn + move to test index.js
		const sourcefile = 'input.svelte';
		[
			// TODO: get line and col num from input.svelte rather than hardcoding here
			[css, '--keep-me', 13, 2],
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
});
