import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
	plugins: [
		{
			name: 'resolve-svelte',
			resolveId(id) {
				if (id.startsWith('svelte')) {
					return id.replace(/^svelte(.*)\/?$/, `${__dirname}$1/index.mjs`);
				}
			}
		}
	],
	test: {
		dir: 'test',
		reporters: ['dot'],
		exclude: [...configDefaults.exclude, '**/samples/**']
	}
});
