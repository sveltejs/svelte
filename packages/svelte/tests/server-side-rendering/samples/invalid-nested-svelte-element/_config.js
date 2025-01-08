import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	errors: [
		'node_invalid_placement_ssr: `<p>` (packages/svelte/tests/server-side-rendering/samples/invalid-nested-svelte-element/main.svelte:2:1) cannot be a child of `<p>` (packages/svelte/tests/server-side-rendering/samples/invalid-nested-svelte-element/main.svelte:1:0)\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.'
	]
});
