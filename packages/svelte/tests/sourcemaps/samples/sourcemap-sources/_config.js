import MagicString, { Bundle } from 'magic-string';
import { TraceMap, originalPositionFor } from '@jridgewell/trace-mapping';
import { test } from '../../test';
import { locate } from 'locate-character';

/**
 * @param {Bundle} bundle
 * @param {string} filename
 * @param {string} source
 */
function add(bundle, filename, source) {
	bundle.addSource({
		filename,
		content: new MagicString(source),
		// @ts-ignore TODO
		separator: '\n'
		//separator: '' // ERROR. probably a bug in magic-string
	});
}

/**
 * @param {Bundle} bundle
 * @param {string} filename
 */
function result(bundle, filename) {
	return {
		code: bundle.toString(),
		map: bundle.generateMap({
			file: filename,
			includeContent: false,
			hires: true // required for remapping
		})
	};
}

export default test({
	skip: true,
	js_map_sources: ['input.svelte', 'foo.js', 'bar.js', 'foo2.js', 'bar2.js'],
	preprocess: [
		{
			script: ({ content, filename = '' }) => {
				const bundle = new Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo.js', 'var answer = 42; // foo.js\n');
				add(bundle, 'bar.js', 'console.log(answer); // bar.js\n');

				return result(bundle, filename);
			}
		},
		{
			script: ({ content, filename = '' }) => {
				const bundle = new Bundle();

				add(bundle, filename, content);
				add(bundle, 'foo2.js', 'var answer2 = 84; // foo2.js\n');
				add(bundle, 'bar2.js', 'console.log(answer2); // bar2.js\n');

				return result(bundle, filename);
			}
		}
	],
	test({ assert, map_client, code_client }) {
		const map = new TraceMap(map_client);
		// sourcemap stores location only for 'answer = 42;'
		// not for 'var answer = 42;'
		/** @type {const} */ ([
			['foo.js', 'answer = 42;', 4],
			['bar.js', 'console.log(answer);', 0],
			['foo2.js', 'answer2 = 84;', 4],
			['bar2.js', 'console.log(answer2);', 0]
		]).forEach(([sourcefile, content, column]) => {
			assert.deepEqual(
				originalPositionFor(map, locate(code_client, content)),
				{
					source: sourcefile,
					name: null,
					line: 1,
					column
				},
				`failed to locate "${content}" from "${sourcefile}"`
			);
		});
	}
});
