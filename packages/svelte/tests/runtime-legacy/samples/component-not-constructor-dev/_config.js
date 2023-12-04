import { test } from '../../test';

export default test({
	skip_if_ssr: 'permanent',
	skip_if_hydrate: 'permanent',
	compileOptions: {
		dev: true
	},
	error: 'this={...} of <svelte:component> should specify a Svelte component.'
});
