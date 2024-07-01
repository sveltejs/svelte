/** @import { Location } from 'locate-character' */
import MagicString from 'magic-string';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { test } from '../../test';
import { magic_string_preprocessor_result, magic_string_replace_all } from '../../helpers.js';
import { getLocator } from 'locate-character';

export default test({
	compileOptions: {
		dev: true,
		css: 'injected'
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
	async test({ assert, code_client }) {
		// Check that the css source map embedded in the js is accurate
		const match = code_client.match(
			/append_styles\(\$\$anchor, "svelte-.{6}", "(.*?)(?:\\n\/\*# sourceMappingURL=data:(.*?);charset=(.*?);base64,(.*?) \*\/)?"\);/
		);

		assert.notEqual(match, null);

		const [css, mime_type, encoding, css_map_base64] = /** @type {RegExpMatchArray} */ (
			match
		).slice(1);
		assert.equal(mime_type, 'application/json');
		assert.equal(encoding, 'utf-8');

		const css_map_json = Buffer.from(css_map_base64, 'base64').toString();
		const map = new TraceMap(css_map_json);
		const sourcefile = '../../input.svelte';
		const locate = getLocator(
			css.replace(/\\r/g, '\r').replace(/\\n/g, '\n').replace(/\\t/g, '\t'),
			{ offsetLine: 1 }
		);

		/** @type {const} */ ([
			['--keep-me: blue', null, 13, 2],
			['--done-replace-once: red', '--replace-me-once', 7, 2],
			['--done-replace-twice: green', '--replace-me-twice', 10, 2]
		]).forEach(([content, name, line, column]) => {
			assert.deepEqual(
				originalPositionFor(map, /** @type {Location} */ (locate(content))),
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
