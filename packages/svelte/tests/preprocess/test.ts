import * as fs from 'node:fs';
import { preprocess } from 'svelte/compiler';
import { expect } from 'vitest';
import { suite, type BaseTest } from '../suite.js';

interface PreprocessTest extends BaseTest {
	options?: { filename: string };
	preprocess:
		| import('svelte/compiler').PreprocessorGroup
		| import('svelte/compiler').PreprocessorGroup[];
	dependencies?: string[];
}

const { test, run } = suite<PreprocessTest>(async (config, cwd) => {
	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8').replace(/\r\n/g, '\n');

	const result = await preprocess(
		input,
		config.preprocess || {},
		config.options || { filename: 'input.svelte' }
	);
	fs.writeFileSync(`${cwd}/_actual.html`, result.code);

	if (result.map) {
		fs.writeFileSync(`${cwd}/_actual.html.map`, JSON.stringify(result.map, null, 2));
	}

	expect(result.code).toMatchFileSnapshot(`${cwd}/output.svelte`);

	expect(result.dependencies).toEqual(config.dependencies || []);

	if (fs.existsSync(`${cwd}/expected_map.json`)) {
		delete (result.map as any).ignoreList;
		const expected_map = JSON.parse(fs.readFileSync(`${cwd}/expected_map.json`, 'utf-8'));
		// You can use https://sokra.github.io/source-map-visualization/#custom to visualize the source map
		expect(JSON.parse(JSON.stringify(result.map))).toEqual(expected_map);
	}
});

export { test };

await run(__dirname);
