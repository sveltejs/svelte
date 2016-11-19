import nodeResolve from 'rollup-plugin-node-resolve';

export default {
	entry: 'compiler/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'dist/svelte.umd.js', format: 'umd' },
		{ dest: 'dist/svelte.es.js', format: 'es' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true })
	]
};
