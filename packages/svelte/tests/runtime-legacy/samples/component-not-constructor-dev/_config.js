import { test } from '../../test';

export default test({
	mode: ['client'],

	compileOptions: {
		dev: true
	},

	error: 'this={...} of <svelte:component> should specify a Svelte component.'
});
