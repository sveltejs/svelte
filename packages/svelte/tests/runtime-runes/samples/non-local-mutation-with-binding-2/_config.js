import { test } from '../../test';

export default test({
	html: `<button>clicks: 0</button>`,

	compileOptions: {
		dev: true
	},

	warnings: [
		'packages/svelte/tests/runtime-runes/samples/non-local-mutation-with-binding-2/Intermediate.svelte passed a value to packages/svelte/tests/runtime-runes/samples/non-local-mutation-with-binding-2/Counter.svelte with `bind:`, but the value is owned by packages/svelte/tests/runtime-runes/samples/non-local-mutation-with-binding-2/main.svelte. Consider creating a binding between packages/svelte/tests/runtime-runes/samples/non-local-mutation-with-binding-2/main.svelte and packages/svelte/tests/runtime-runes/samples/non-local-mutation-with-binding-2/Intermediate.svelte'
	]
});
