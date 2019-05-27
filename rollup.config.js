import fs from 'fs';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import sucrase from 'rollup-plugin-sucrase';
import typescript from 'rollup-plugin-typescript';
import pkg from './package.json';

const is_publish = !!process.env.PUBLISH;

const ts_plugin = is_publish
	? typescript({
		include: 'src/**',
		typescript: require('typescript')
	})
	: sucrase({
		transforms: ['typescript']
	});

const external = id => id.startsWith('svelte/');

export default [
	/* compiler.js */
	{
		input: 'src/compiler/index.ts',
		plugins: [
			replace({
				__VERSION__: pkg.version
			}),
			resolve(),
			commonjs({
				include: ['node_modules/**']
			}),
			json(),
			ts_plugin
		],
		output: {
			file: 'compiler.js',
			format: is_publish ? 'umd' : 'cjs',
			name: 'svelte',
			sourcemap: true,
		},
		external: is_publish
			? []
			: id => id === 'acorn' || id === 'magic-string' || id.startsWith('css-tree')
	},

	/* runtime */
	{
		input: `src/runtime/index.ts`,
		output: [
			{
				file: `index.mjs`,
				format: 'esm',
				paths: id => id.startsWith('svelte/') && `${id.replace('svelte', '.')}`
			},
			{
				file: `index.js`,
				format: 'cjs',
				paths: id => id.startsWith('svelte/') && `${id.replace('svelte', '.')}`
			}
		],
		external,
		plugins: [ts_plugin]
	},

	...fs.readdirSync('src/runtime')
		.filter(dir => fs.statSync(`src/runtime/${dir}`).isDirectory())
		.map(dir => ({
			input: `src/runtime/${dir}/index.ts`,
			output: [
				{
					file: `${dir}/index.mjs`,
					format: 'esm',
					paths: id => id.startsWith('svelte/') && `${id.replace('svelte', '..')}`
				},
				{
					file: `${dir}/index.js`,
					format: 'cjs',
					paths: id => id.startsWith('svelte/') && `${id.replace('svelte', '..')}`
				}
			],
			external,
			plugins: [ts_plugin]
		}))
];
