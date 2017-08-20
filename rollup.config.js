import path from 'path';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';
import buble from 'rollup-plugin-buble';

const src = path.resolve('src');

export default [
	/* compiler/svelte.js */
	{
		input: 'src/index.ts',
		plugins: [
			{
				resolveId(importee, importer) {
					// bit of a hack — TypeScript only really works if it can resolve imports,
					// but they misguidedly chose to reject imports with file extensions. This
					// means we need to resolve them here
					if (
						importer &&
						importer.startsWith(src) &&
						importee[0] === '.' &&
						path.extname(importee) === ''
					) {
						return path.resolve(path.dirname(importer), `${importee}.ts`);
					}
				}
			},
			nodeResolve({ jsnext: true, module: true }),
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
		input: 'src/server-side-rendering/register.js',
		plugins: [
			nodeResolve({ jsnext: true, module: true }),
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

	/* shared.js */
	{
		input: 'src/shared/index.js',
		output: {
			file: 'shared.js',
			format: 'es'
		}
	}
];
