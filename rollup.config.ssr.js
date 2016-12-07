import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'src/ssr/register.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'ssr/register.js', format: 'cjs' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs()
	],
	external: [ 'svelte', 'magic-string' ],
	paths: {
		svelte: '../dist/svelte.js'
	},
	sourceMap: true
};
