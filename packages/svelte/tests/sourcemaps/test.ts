import * as fs from 'node:fs';
import { assert } from 'vitest';
import { getLocator, locate } from 'locate-character';
import { suite, type BaseTest } from '../suite.js';
import { compile_directory } from '../helpers.js';
import { decode } from '@jridgewell/sourcemap-codec';

type SourceMapEntry =
	| string
	| {
			/** If not the first occurence, but the nth should be found */
			idxOriginal?: number;
			/** If not the first occurence, but the nth should be found */
			idxGenerated?: number;
			/** The original string to find */
			str: string;
			/** The generated string to find. You can omit this if it's the same as the original string */
			strGenerated?: string | null;
			/** If the original code lives in a different file, pass its source code here */
			code?: string;
	  };

interface SourcemapTest extends BaseTest {
	options?: { filename: string };
	compileOptions?: Partial<import('#compiler').CompileOptions>;
	preprocess?:
		| import('../../src/compiler/public').PreprocessorGroup
		| import('../../src/compiler/public').PreprocessorGroup[];
	/** The expected `sources` array in the source map */
	js_map_sources?: string[];
	/** The expected `sources` array in the source map */
	css_map_sources?: string[];
	test?: (obj: {
		assert: typeof assert;
		input: string;
		map_preprocessed: any;
		code_preprocessed: string;
		map_css: any;
		code_css: string;
		map_client: any;
		code_client: string;
	}) => void;
	/** Mappings to check in generated client code */
	client?: SourceMapEntry[] | null;
	/** Mappings to check in generated server code. If left out, will use the client code checks */
	server?: SourceMapEntry[];
	/** Mappings to check in generated css code */
	css?: SourceMapEntry[] | null;
	/** Mappings to check in preprocessed Svelte code */
	preprocessed?: SourceMapEntry[];
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

	function compare(info: string, output: string, map: any, entries: SourceMapEntry[]) {
		const output_locator = getLocator(output);

		/** Find line/column of string in original code */
		function find_original(entry: SourceMapEntry, idx = 0) {
			let str;
			let source;
			if (typeof entry === 'string') {
				str = entry;
				source = input;
			} else if (entry.code) {
				str = entry.str;
				source = entry.code;
			} else {
				str = entry.str;
				source = input;
			}

			const original = locate(source, source.indexOf(str, idx));
			if (!original)
				throw new Error(`Could not find '${str}'${idx > 0 ? ` after index ${idx}` : ''} in input`);
			return original;
		}

		/** Find line/column of string in generated code */
		function find_generated(str: string, idx = 0) {
			const generated = output_locator(output.indexOf(str, idx));
			if (!generated)
				throw new Error(`Could not find '${str}'${idx > 0 ? ` after index ${idx}` : ''} in output`);
			return generated;
		}

		const decoded = decode(map.mappings);

		try {
			for (let entry of entries) {
				entry = typeof entry === 'string' ? { str: entry } : entry;

				const str = entry.str;

				// Find generated line/column
				const generated_str = entry.strGenerated ?? str;
				if (entry.strGenerated === null) {
					if (!output.includes(generated_str)) continue;
				}
				let generated = find_generated(generated_str);
				if (entry.idxGenerated) {
					let i = entry.idxGenerated;
					while (i-- > 0) {
						generated = find_generated(generated_str, generated.character + 1);
					}
				}

				// Find segment in source map pointing from generated to original
				const segments = decoded[generated.line];
				const segment = segments.find((segment) => segment[0] === generated.column);
				if (!segment && entry.strGenerated !== null) {
					throw new Error(
						`Could not find segment for '${str}' in sourcemap (${generated.line}:${generated.column})`
					);
				} else if (segment && entry.strGenerated === null) {
					throw new Error(
						`Found segment for '${str}' in sourcemap (${generated.line}:${generated.column}) but should not`
					);
				} else if (!segment) {
					continue;
				}

				// Find original line/column
				let original = find_original(entry);
				if (entry.idxOriginal) {
					let i = entry.idxOriginal;
					while (i-- > 0) {
						original = find_original(entry, original.character + 1);
					}
				}

				// Check that segment points to expected original
				assert.equal(segment[2], original.line, `mapped line did not match for '${str}'`);
				assert.equal(segment[3], original.column, `mapped column did not match for '${str}'`);

				// Same for end of string
				const generated_end = generated.column + generated_str.length;
				const end_segment = segments.find((segment) => segment[0] === generated_end);
				if (!end_segment) {
					// If the string is the last segment and it's the end of the line,
					// it's okay if there's no end segment (source maps save space by omitting it in that case)
					if (
						segments.at(-1)![0] > generated_end ||
						!/[\r\n]/.test(output[generated.character + generated_str.length])
					) {
						console.log(segments.at(-1)![0] < generated_end, segments.at(-1)![0], generated_end);
						console.log(
							/[\r\n]/.test(output[generated.character + generated_str.length]),
							output[generated.character + generated_str.length] +
								'::' +
								output.slice(
									generated.character + generated_str.length - 10,
									generated.character + generated_str.length + 10
								)
						);
						throw new Error(
							`Could not find end segment for '${str}' in sourcemap (${generated.line}:${generated_end})`
						);
					} else {
						continue;
					}
				}

				assert.equal(end_segment[2], original.line, `mapped line end did not match for '${str}'`);
				assert.equal(
					end_segment[3],
					original.column + str.length,
					`mapped column end did not match for '${str}'`
				);
			}
		} catch (e) {
			console.log(`Source map ${info}:\n`);
			console.log(decoded);
			throw e;
		}
	}

	let map_client = null;
	let code_client = fs.readFileSync(`${cwd}/_output/client/input.svelte.js`, 'utf-8');

	if (config.client === null) {
		assert.equal(
			fs.existsSync(`${cwd}/_output/client/input.svelte.js.map`),
			false,
			'Expected no source map'
		);
	} else {
		map_client = JSON.parse(fs.readFileSync(`${cwd}/_output/client/input.svelte.js.map`, 'utf-8'));
		assert.deepEqual(
			map_client.sources.slice().sort(),
			(config.js_map_sources || ['../../input.svelte']).sort(),
			'js.map.sources is wrong'
		);

		if (config.client) {
			compare('client', code_client, map_client, config.client);
		}
	}

	if (config.client || config.server) {
		const output_server = fs.readFileSync(`${cwd}/_output/server/input.svelte.js`, 'utf-8');
		const map_server = JSON.parse(
			fs.readFileSync(`${cwd}/_output/server/input.svelte.js.map`, 'utf-8')
		);

		compare(
			'server',
			output_server,
			map_server,
			config.server ??
				// Reuse client sourcemap test for server
				config.client ??
				[]
		);
	}

	let map_css = null;
	let code_css = '';
	if (config.css !== undefined) {
		if (config.css === null) {
			assert.equal(
				fs.existsSync(`${cwd}/_output/client/input.svelte.css.map`),
				false,
				'Expected no source map'
			);
		} else {
			code_css = fs.readFileSync(`${cwd}/_output/client/input.svelte.css`, 'utf-8');
			map_css = JSON.parse(fs.readFileSync(`${cwd}/_output/client/input.svelte.css.map`, 'utf-8'));
			assert.deepEqual(
				map_css.sources.slice().sort(),
				(config.css_map_sources || ['../../input.svelte']).sort(),
				'css.map.sources is wrong'
			);
			compare('css', code_css, map_css, config.css);
		}
	}

	let map_preprocessed = null;
	let code_preprocessed = '';
	if (config.preprocessed !== undefined) {
		if (config.preprocessed === null) {
			assert.equal(
				fs.existsSync(`${cwd}/_output/client/input.preprocessed.svelte.map`),
				false,
				'Expected no source map'
			);
		} else {
			code_preprocessed = fs.readFileSync(
				`${cwd}/_output/client/input.preprocessed.svelte`,
				'utf-8'
			);
			map_preprocessed = JSON.parse(
				fs.readFileSync(`${cwd}/_output/client/input.preprocessed.svelte.map`, 'utf-8')
			);
			compare('preprocessed', code_preprocessed, map_preprocessed, config.preprocessed);
		}
	}

	if (config.test) {
		// TODO figure out for which tests we still need this
		config.test({
			assert,
			input,
			map_client,
			code_client,
			map_preprocessed,
			code_preprocessed,
			code_css,
			map_css
		});
	}
});

export { test };

await run(__dirname);
