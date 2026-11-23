import * as fs from 'node:fs';
import * as path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

const pkg = JSON.parse(fs.readFileSync('packages/svelte/package.json', 'utf8'));

/**
 * Vitest only runs test files in parallel, not the tests within a file. These suites have
 * thousands of tests, so they are split into several shards that each run as their own
 * project (and therefore in their own worker), executing a part of the samples.
 *
 * Samples whose name starts with one of the `isolate` prefixes get a shard of their own instead,
 * because they change global state that would otherwise leak into all subsequent tests running
 * in the same worker (`$inspect.trace` turns on the much slower tracing mode for good).
 *
 * See `for_each_dir` in `packages/svelte/tests/suite.ts`
 */
const sharded_suites = {
	'packages/svelte/tests/runtime-runes/test.ts': { count: 4, isolate: ['inspect-trace'] },
	'packages/svelte/tests/runtime-legacy/test.ts': { count: 3, isolate: [] }
};

/**
 * Resolves `svelte` / `svelte/*` imports against the package's `exports` map.
 *
 * @param {boolean} force_server When `true`, always resolve to the server
 *   (`default`) condition. This is used by the `custom-renderer-server` project
 *   to simulate running in Node *without* the `custom-renderer`/`browser`
 *   resolve condition. Otherwise the client (`browser`) build is preferred,
 *   except for compiled SSR output (`_output/server`).
 */
function svelte_alias(force_server = false) {
	return [
		{
			find: /^svelte\/?/,
			/**
			 * @param {string} id
			 * @param {string | undefined} importer
			 */
			customResolver: (id, importer) => {
				// For some reason this turns up as "undefined" instead of "svelte/"
				const exported = pkg.exports[id === 'undefined' ? '.' : id.replace('undefined', './')];
				if (!exported) return;

				// When running the server version of the Svelte files,
				// we also want to use the server export of the Svelte package
				const use_server = force_server || importer?.includes('_output/server');

				return path.resolve(
					'packages/svelte',
					use_server ? exported.default : exported.browser ?? exported.default
				);
			}
		}
	];
}

export default defineConfig({
	test: {
		dir: '.',
		reporters: process.env.GITHUB_ACTIONS === 'true' ? ['minimal'] : ['dot'],
		// A handful of dev-mode tests trigger Svelte's `effect_update_depth_exceeded`
		// guard, which involves ~1000 Error objects per flush for stack tracking —
		// slow enough under vitest 4's deeper async stacks (and CI's slower workers)
		// to overrun the 5s default.
		testTimeout: 30_000,
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'html'],
			include: ['packages/svelte/src/**'],
			reportsDirectory: 'coverage',
			reportOnFailure: true
		},
		projects: [
			{
				extends: true,
				resolve: { alias: svelte_alias() },
				test: {
					name: 'svelte',
					include: [
						'packages/svelte/**/*.test.ts',
						'packages/svelte/tests/*/test.ts',
						'packages/svelte/tests/runtime-browser/test-ssr.ts'
					],
					exclude: [
						...configDefaults.exclude,
						'**/samples/**',
						...Object.keys(sharded_suites),
						// runs in its own project with the server resolve condition
						'packages/svelte/tests/custom-renderers-server/**'
					]
				}
			},
			...Object.entries(sharded_suites).flatMap(([file, { count, isolate }]) => {
				const suite = path.basename(path.dirname(file));

				/**
				 * @param {string} name
				 * @param {{ index: number, count: number, include?: string, exclude?: string[] }} shard
				 */
				const project = (name, shard) => ({
					extends: /** @type {const} */ (true),
					resolve: { alias: svelte_alias() },
					test: { name: `${suite} (${name})`, include: [file], provide: { shard } }
				});

				return [
					...Array.from({ length: count }, (_, index) =>
						project(`${index + 1}/${count}`, { index, count, exclude: isolate })
					),
					...isolate.map((prefix) => project(prefix, { index: 0, count: 1, include: prefix }))
				];
			}),
			{
				extends: true,
				// resolve `svelte` as if no `custom-renderer`/`browser` condition was set
				resolve: { alias: svelte_alias(true) },
				test: {
					name: { label: 'custom-renderer-server', color: 'red' },
					environment: 'node',
					include: ['packages/svelte/tests/custom-renderers-server/test.ts']
				}
			}
		]
	}
});
