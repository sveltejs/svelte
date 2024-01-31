import * as fs from 'node:fs';
import * as path from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';

const pkg = JSON.parse(fs.readFileSync('packages/svelte/package.json', 'utf8'));

export default defineConfig({
	// We need both a plugin and an alias for some reason
	resolve: {
		alias: [
			{
				find: /^svelte\/?/,
				customResolver: (id) => {
					// For some reason this turns up as "undefined" instead of "svelte"
					const exported = pkg.exports[id.replace('undefined', '.')];
					if (!exported) return;

					return path.resolve('packages/svelte', exported.browser ?? exported.default);
				}
			}
		]
	},
	plugins: [
		{
			name: 'resolve-svelte',
			resolveId(id) {
				if (/^svelte\/?/.test(id)) {
					const exported = pkg.exports[id.replace('svelte', '.')];
					if (!exported) return;

					return path.resolve('packages/svelte', exported.browser ?? exported.default);
				}
			}
		}
	],
	test: {
		dir: '.',
		reporters: ['dot'],
		include: [
			'packages/svelte/**/*.test.ts',
			'packages/svelte/tests/*/test.ts',
			'packages/svelte/tests/runtime-browser/test-ssr.ts'
		],
		exclude: [...configDefaults.exclude, '**/samples/**'],
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'html']
		}
	}
});
