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
			transforms: {
				arrow: false,
				classes: false,
				conciseMethodProperty: false,
				templateString: false,
				letConst: false,
				numericLiteral: false
			}
		})
	],
	external: [ 'magic-string' ],
	globals: {
		'magic-string': 'MagicString'
	},
	sourceMap: true
};
