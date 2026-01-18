export default {
	/** @type {import('svelte/compiler').CompileOptions} */
	compilerOptions: {
		css: 'injected',

		hmr: false,

		experimental: {
			async: true
		}
	}
};
