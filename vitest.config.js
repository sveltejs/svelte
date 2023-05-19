import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [
		{
			name: 'resolve-svelte',
			resolveId(id) {
				if (id === "svelte/compiler") {
					return `${__dirname}/compiler.mjs`;
				}

				if (id.startsWith('svelte')) {
					return id.replace(/^svelte(.*)\/?$/, `${__dirname}$1/index.mjs`);
				}
			}
		}
	],
	test: {
		dir: 'test',
		reporters: ['dot', 'hanging-process'],
		exclude: [...configDefaults.exclude, '**/samples/**'],
		globalSetup: './test/vitest-global-setup.js'
	}
});
