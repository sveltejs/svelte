import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: [
		'Intermediate.svelte passed a value to Counter.svelte with `bind:`, but the value is owned by main.svelte. Consider creating a binding between main.svelte and Intermediate.svelte'
	]
});
