import { test } from '../../test';

export default test({
	skip_if_hydrate: 'permanent', // SSR errors on render already
	compileOptions: {
		dev: true
	},
	get props() {
		return { tag: 123 };
	},
	error: '<svelte:element> expects "this" attribute to be a string.'
});
