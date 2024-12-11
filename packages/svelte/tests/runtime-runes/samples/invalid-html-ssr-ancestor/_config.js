import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	html: `<form><div></div></form>`,

	recover: true,

	mode: ['hydrate'],

	errors: [
		'node_invalid_placement_ssr: `<form>` (form.svelte:1:0) cannot be a descendant of `<form>` (main.svelte:5:0)\n\nThis can cause content to shift around as the browser repairs the HTML, and will likely result in a `hydration_mismatch` warning.'
	],

	warnings: [
		'Hydration failed because the initial UI does not match what was rendered on the server'
	]
});
