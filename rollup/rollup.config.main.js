import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import buble from 'rollup-plugin-buble';

export default {
	entry: 'src/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'compiler/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs(),
		json(),
		buble({
			include: 'src/**',
			exclude: 'src/shared/**',
			target: {
				node: 4
			}
		})
	],
	sourceMap: true
};
