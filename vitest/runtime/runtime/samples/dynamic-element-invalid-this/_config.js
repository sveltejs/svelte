export default {
	compileOptions: {
		dev: true
	},
	get props() {
		return { tag: 123 };
	},
	error: '<svelte:element> expects "this" attribute to be a string.'
};
