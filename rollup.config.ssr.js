import * as path from 'path';
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
	external: [ path.resolve( 'src/index.js' ), 'fs', 'magic-string' ],
	paths: {
		[ path.resolve( 'src/index.js' ) ]: '../compiler/svelte.js'
	},
	sourceMap: true
};
