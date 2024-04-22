import { test } from '../../test';

export default test({
	mode: ['client', 'server'], // SSR errors on render already

	compileOptions: {
		dev: true
	},

	get props() {
		return { tag: 123 };
	},

	error: '<svelte:element> expects "this" attribute to be a string.'
});
