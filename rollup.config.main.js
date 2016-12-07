import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'src/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'compiler/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs()
	],
	external: [ 'magic-string' ],
	sourceMap: true
};
