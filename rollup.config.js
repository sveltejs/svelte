import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [
	/* compiler.js */
	{
		input: 'src/index.ts',
		plugins: [
			replace({
				__VERSION__: pkg.version
			}),
			resolve(),
			commonjs(),
			json(),
			typescript({
				include: 'src/**',
				exclude: 'src/internal/**',
				typescript: require('typescript')
			})
		],
		output: {
			file: 'compiler.js',
			format: 'umd',
			name: 'svelte',
			sourcemap: true
		}
	},

	/* cli/*.js */
	{
		input: ['src/cli/index.ts'],
		output: {
			dir: 'cli',
			format: 'cjs',
			paths: {
				svelte: '../compiler.js'
			}
		},
		external: ['fs', 'path', 'os', 'svelte'],
		plugins: [
			json(),
			commonjs(),
			resolve(),
			typescript({
				typescript: require('typescript')
			})
		],
		experimentalCodeSplitting: true
	},

	/* internal.[m]js, motion.mjs */
	...['internal', 'motion'].map(name => ({
		input: `src/${name}/index.js`,
		output: [
			{
				file: `${name}.mjs`,
				format: 'esm',
				paths: id => id.startsWith('svelte/') && id.replace('svelte', '.')
			},
			{
				file: `${name}.js`,
				format: 'cjs',
				paths: id => id.startsWith('svelte/') && id.replace('svelte', '.')
			}
		],
		external: id => id.startsWith('svelte/')
	})),

	// everything else
	...['index', 'store', 'easing', 'transition'].map(name => ({
		input: `${name}.mjs`,
		output: {
			file: `${name}.js`,
			format: 'cjs',
			paths: id => id.startsWith('svelte/') && id.replace('svelte', '.')
		},
		external: id => id !== `${name}.mjs`
	}))
];
