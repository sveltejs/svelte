import { test } from '../../test';

export default test({
	skip: true, // TODO: This test actually works, but the error message is printed, not thrown, so we need to have a way to test for that
	compileOptions: {
		dev: true
	},

	error:
		'node_invalid_placement_ssr: `<p>` (packages/svelte/tests/server-side-rendering/samples/invalid-nested-svelte-element/main.svelte:2:1) cannot be a child of `<p>` (packages/svelte/tests/server-side-rendering/samples/invalid-nested-svelte-element/main.svelte:1:0)\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.'
});
