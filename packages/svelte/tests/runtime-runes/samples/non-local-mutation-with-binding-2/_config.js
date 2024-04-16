import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: [
		'.../samples/non-local-mutation-with-binding-2/Intermediate.svelte passed a value to .../samples/non-local-mutation-with-binding-2/Counter.svelte with `bind:`, but the value is owned by .../samples/non-local-mutation-with-binding-2/main.svelte. Consider creating a binding between .../samples/non-local-mutation-with-binding-2/main.svelte and .../samples/non-local-mutation-with-binding-2/Intermediate.svelte'
	]
});
