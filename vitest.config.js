import * as fs from 'node:fs';
import * as path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

const pkg = JSON.parse(fs.readFileSync('packages/svelte/package.json', 'utf8'));

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
		reporters: ['dot'],
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
						// runs in its own project with the server resolve condition
						'packages/svelte/tests/custom-renderers-server/**'
					]
				}
			},
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
