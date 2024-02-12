import * as fs from 'node:fs';
import { assert } from 'vitest';
import { getLocator } from 'locate-character';
import { suite, type BaseTest } from '../suite.js';
import { compile_directory } from '../helpers.js';
import { decode } from '@jridgewell/sourcemap-codec';

interface SourcemapTest extends BaseTest {
	options?: { filename: string };
	compileOptions?: Partial<import('#compiler').CompileOptions>;
	preprocess?:
		| import('../../src/compiler/public').PreprocessorGroup
		| import('../../src/compiler/public').PreprocessorGroup[];
	js_map_sources?: string[];
	css_map_sources?: string[];
	test?: (obj: { assert: any; input: any; preprocessed: any; js: any; css: any }) => void;
	client: Array<
		string | { idxOriginal?: number; idxGenerated?: number; str: string; strGenerated?: string }
	> | null;
	server?: Array<
		string | { idxOriginal?: number; idxGenerated?: number; str: string; strGenerated?: string }
	>;
	css?: Array<
		string | { idxOriginal?: number; idxGenerated?: number; str: string; strGenerated?: string }
	> | null;
}

const { test, run } = suite<SourcemapTest>(async (config, cwd) => {
	await compile_directory(cwd, 'client', config.compileOptions, true, {
		preprocess: config.preprocess,
		options: config.options
	});
	await compile_directory(cwd, 'server', config.compileOptions, true, {
		preprocess: config.preprocess,
		options: config.options
	});

	const input = fs.readFileSync(`${cwd}/input.svelte`, 'utf-8');
	const input_locator = getLocator(input);

	function compare(
		info: string,
		output: string,
		map: any,
		strings: NonNullable<SourcemapTest['client']>
	) {
		const output_locator = getLocator(output);

		function find_original(str: string, idx = 0) {
			const original = input_locator(input.indexOf(str, idx));
			if (!original)
				throw new Error(`Could not find '${str}'${idx > 0 ? ` after index ${idx}` : ''} in input`);
			return original;
		}

		function find_generated(str: string, idx = 0) {
			const generated = output_locator(output.indexOf(str, idx));
			if (!generated)
				throw new Error(`Could not find '${str}'${idx > 0 ? ` after index ${idx}` : ''} in output`);
			return generated;
		}

		const decoded = decode(map.mappings);

		try {
			for (const entry of strings) {
				const str = typeof entry === 'string' ? entry : entry.str;
				let original = find_original(str);
				if (typeof entry !== 'string' && entry.idxOriginal) {
					let i = entry.idxOriginal;
					while (i-- > 0) {
						original = find_original(str, original.character + 1);
					}
				}

				let generated = find_generated(str);
				if (typeof entry !== 'string' && entry.idxGenerated) {
					let i = entry.idxGenerated;
					while (i-- > 0) {
						generated = find_generated(str, generated.character + 1);
					}
				}

				const segments = decoded[generated.line];
				const segment = segments.find((segment) => segment[0] === generated.column);
				if (!segment) throw new Error(`Could not find segment for '${str}' in sourcemap`);

				assert.equal(segment[2], original.line, 'mapped line did not match');
				assert.equal(segment[3], original.column, 'mapped column did not match');

				const end_segment = segments.find(
					(segment) => segment[0] === generated.column + str.length
				);
				if (!end_segment) throw new Error(`Could not find end segment for '${str}' in sourcemap`);

				assert.equal(end_segment[2], original.line, 'mapped line end did not match');
				assert.equal(
					end_segment[3],
					original.column + str.length,
					'mapped column end did not match'
				);
			}
		} catch (e) {
			console.log(`Source map ${info}:\n`);
			console.log(decoded);
			throw e;
		}
	}

	if (config.client === null) {
		assert.equal(
			fs.existsSync(`${cwd}/_output/client/input.svelte.js.map`),
			false,
			'Expected no source map'
		);
	} else {
		const output_client = fs.readFileSync(`${cwd}/_output/client/input.svelte.js`, 'utf-8');
		const map_client = JSON.parse(
			fs.readFileSync(`${cwd}/_output/client/input.svelte.js.map`, 'utf-8')
		);
		compare('client', output_client, map_client, config.client);

		const output_server = fs.readFileSync(`${cwd}/_output/server/input.svelte.js`, 'utf-8');
		const map_server = JSON.parse(
			fs.readFileSync(`${cwd}/_output/server/input.svelte.js.map`, 'utf-8')
		);
		compare('server', output_server, map_server, config.server ?? config.client);
	}

	if (config.css !== undefined) {
		if (config.css === null) {
			assert.equal(
				fs.existsSync(`${cwd}/_output/client/input.svelte.css.map`),
				false,
				'Expected no source map'
			);
		} else {
			const output = fs.readFileSync(`${cwd}/_output/client/input.svelte.css`, 'utf-8');
			const map = JSON.parse(
				fs.readFileSync(`${cwd}/_output/client/input.svelte.css.map`, 'utf-8')
			);
			compare('css', output, map, config.css);
		}
	}

	if (config.test) {
		// TODO figure out for which tests we still need this
		config.test({ assert /*, input, preprocessed: output_client, js, css*/ });
	}
});

export { test };

await run(__dirname);
