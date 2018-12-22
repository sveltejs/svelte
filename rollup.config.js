import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

export default [
	/* compiler/svelte.js */
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

	/* internal.js */
	{
		input: 'src/internal/index.js',
		output: {
			file: 'internal.js',
			format: 'es'
		}
	}
];
