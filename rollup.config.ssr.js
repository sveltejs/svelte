import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
	entry: 'src/server-side-rendering/register.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'ssr/register.js', format: 'cjs' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs()
	],
	external: [ 'src/index.js', 'magic-string' ],
	paths: {
		'src/index.js': '../compiler/svelte.js'
	},
	sourceMap: true
};
