import nodeResolve from 'rollup-plugin-node-resolve';
import buble from 'rollup-plugin-buble';

export default {
	entry: 'compiler/index.js',
	moduleName: 'svelte',
	targets: [
		{ dest: 'dist/svelte.js', format: 'umd' }
	],
	plugins: [
		nodeResolve({ jsnext: true, module: true }),
		buble({
			transforms: {
				dangerousForOf: true,
				dangerousTaggedTemplateString: true
			}
		})
	]
};
