import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json';
import typescript from 'rollup-plugin-typescript';

export default {
	entry: 'src/index.ts',
	moduleName: 'svelte',
	targets: [
		{ dest: 'compiler/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		commonjs(),
		json(),
		typescript({
			include: 'src/**',
			exclude: 'src/shared/**',
			typescript: require( 'typescript' )
		})
	],
	sourceMap: true
};
