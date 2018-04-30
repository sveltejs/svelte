import path from 'path';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import buble from 'rollup-plugin-buble';
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
				exclude: 'src/shared/**',
				typescript: require('typescript')
			})
		],
		output: {
			file: 'compiler/svelte.js',
			format: 'umd',
			name: 'svelte',
			sourcemap: true
		}
	},

	/* ssr/register.js */
	{
		input: 'src/ssr/register.js',
		plugins: [
			resolve(),
			commonjs(),
			buble({
				include: 'src/**',
				exclude: 'src/shared/**',
				target: {
					node: 4
				}
			})
		],
		external: [path.resolve('src/index.ts'), 'fs', 'path'],
		output: {
			file: 'ssr/register.js',
			format: 'cjs',
			paths: {
				[path.resolve('src/index.ts')]: '../compiler/svelte.js'
			},
			sourcemap: true
		}
	},

	/* cli/*.js */
	{
		input: ['src/cli/index.js'],
		output: {
			dir: 'cli',
			format: 'cjs'
		},
		external: ['fs', 'path', 'os', 'svelte'],
		paths: {
			svelte: '../compiler/svelte.js'
		},
		plugins: [
			json(),
			commonjs(),
			resolve()
		],
		experimentalDynamicImport: true,
		experimentalCodeSplitting: true
	},

	/* shared.js */
	{
		input: 'src/shared/index.js',
		output: {
			file: 'shared.js',
			format: 'es'
		}
	}
];
