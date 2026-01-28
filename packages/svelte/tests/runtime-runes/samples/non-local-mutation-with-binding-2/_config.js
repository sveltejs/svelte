import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: [
		'Intermediate.svelte passed property `object` to Counter.svelte with `bind:`, but its parent component main.svelte did not declare `object` as a binding. Consider creating a binding between main.svelte and Intermediate.svelte (e.g. `bind:object={...}` instead of `object={...}`)'
	]
});
