import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<p></p><h1>foo</h1><p></p><form></form>`,

	recover: true,

	mode: ['hydrate'],

	errors: [
		'node_invalid_placement_ssr: `<h1>` (h1.svelte:1:0) cannot be a child of `<p>` (main.svelte:6:0)\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.',
		'node_invalid_placement_ssr: `<form>` (form.svelte:1:0) cannot be a child of `<form>` (main.svelte:9:0)\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.'
	],

	warnings: [
		'Hydration failed because the initial UI does not match what was rendered on the server'
	]
});
