export default {
	error: `Function called outside component initialization`,
	after_test() {
		// clear cache for `svelte/internal`
		delete require.cache[require.resolve(process.cwd() + '/internal')];
	},
};