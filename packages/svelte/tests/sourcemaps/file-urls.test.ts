import { assert, describe, it } from 'vitest';
import { compile, preprocess } from 'svelte/compiler';
import MagicString, { Bundle } from 'magic-string';

const source = `<script>console.log('component');</script>
<h1>Hello world!</h1>
<style>h1 { color: red; }</style>`;

describe.each(['client', 'server'] as const)('%s sourcemap file URLs', (generate) => {
	it.each([
		'file:///project/src/input.svelte',
		'file:///project/with%20spaces/input.svelte',
		'file:///C:/project/src/input.svelte',
		'file://server/share/input.svelte'
	])('preserves the absolute filename %s', (filename) => {
		for (const output_filename of [undefined, '/build/output.js', 'file:///build/output.js']) {
			const result = compile(source, {
				filename,
				outputFilename: output_filename,
				cssOutputFilename: output_filename?.replace('.js', '.css'),
				generate
			});

			assert.deepEqual(result.js.map.sources, [filename]);
			assert.deepEqual(result.css?.map.sources, [filename]);
			assert.deepEqual(result.js.map.sourcesContent, [source]);
			assert.deepEqual(result.css?.map.sourcesContent, [source]);
		}
	});

	it('resolves relative preprocessor sources against the component URL', async () => {
		const filename = 'file:///project/src/input.svelte';
		const processed = await preprocess(
			source,
			{
				script: ({ content }) => {
					const bundle = new Bundle({ separator: '\n' });
					for (const [filename, code] of [
						['input.svelte', content],
						['../shared.js', "console.log('relative');"],
						['file:///external/helper.js', "console.log('absolute');"]
					]) {
						bundle.addSource({ filename, content: new MagicString(code) });
					}
					return { code: bundle.toString(), map: bundle.generateMap({ hires: true }) };
				}
			},
			{ filename }
		);
		const result = compile(processed.code, {
			filename,
			outputFilename: '/build/output.js',
			cssOutputFilename: '/build/output.css',
			sourcemap: processed.map,
			generate
		});

		assert.deepEqual(result.js.map.sources.toSorted(), [
			'file:///external/helper.js',
			'file:///project/shared.js',
			filename
		]);
		assert.deepEqual(result.css?.map.sources, [filename]);
	});

	it('preserves preprocessor file URLs when the component uses a filesystem path', async () => {
		const filename = '/project/input.svelte';
		const original = 'file:///original/input.svelte';
		const processed = await preprocess(
			source,
			{
				markup: ({ content }) => ({
					code: content,
					map: new MagicString(content).generateMap({ source: original, hires: true })
				})
			},
			{ filename }
		);
		const result = compile(processed.code, {
			filename,
			outputFilename: '/project/build/output.js',
			cssOutputFilename: '/project/build/output.css',
			sourcemap: processed.map,
			generate
		});

		assert.deepEqual(result.js.map.sources, [original]);
		assert.deepEqual(result.css?.map.sources, [original]);
	});
});
