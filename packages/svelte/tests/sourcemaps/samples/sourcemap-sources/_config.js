import MagicString, { Bundle } from 'magic-string';
import * as path from 'node:path';
import { test } from '../../test';

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

const FOO = 'var answer = 42; // foo.js\n';
const BAR = 'console.log(answer); // bar.js\n';
const FOO2 = 'var answer2 = 84; // foo2.js\n';
const BAR2 = 'console.log(answer2); // bar2.js\n';

export default test({
	js_map_sources: [
		'../../input.svelte',
		'../../foo.js',
		'../../bar.js',
		'../../foo2.js',
		'../../bar2.js'
	],
	preprocess: [
		{
			script: ({ content, filename = '' }) => {
				const bundle = new Bundle();

				add(bundle, path.basename(filename), content);
				add(bundle, 'foo.js', FOO);
				add(bundle, 'bar.js', BAR);

				return result(bundle, path.basename(filename));
			}
		},
		{
			script: ({ content, filename = '' }) => {
				const bundle = new Bundle();

				add(bundle, path.basename(filename), content);
				add(bundle, 'foo2.js', FOO2);
				add(bundle, 'bar2.js', BAR2);

				return result(bundle, path.basename(filename));
			}
		}
	],
	client: [
		{
			code: FOO,
			str: 'answer'
		},
		{
			code: BAR,
			str: 'answer',
			idxGenerated: 1
		},
		{
			code: FOO2,
			str: 'answer2'
		},
		{
			code: BAR2,
			str: 'answer2',
			idxGenerated: 1
		}
	]
});
