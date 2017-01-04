import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';

export default {
	entry: 'src/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'compiler/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs(),
		json()
	],
	external: [ 'magic-string' ],
	globals: {
		'magic-string': 'MagicString'
	},
	sourceMap: true
};
