export default {
	compileOptions: {
		dev: true
	},
	get props() {
		return { tag: 'br' };
	},
	warnings: ['<svelte:element this="br"> is self-closing and cannot have content.']
};
