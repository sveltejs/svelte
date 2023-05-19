import { defineConfig, configDefaults } from 'vitest/config';

export default defineConfig({
	plugins: [
		{
			name: 'resolve-svelte',
			resolveId(id) {
				if (id === 'svelte') {
					return `${__dirname}/src/runtime/index.js`;
				}
				if (id.startsWith('svelte/')) {
					return id.replace(/^svelte(.*)\/?$/, `${__dirname}/src/runtime/$1/index.js`);
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
