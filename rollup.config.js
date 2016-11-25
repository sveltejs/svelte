import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'compiler/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'dist/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true })
	]
};
