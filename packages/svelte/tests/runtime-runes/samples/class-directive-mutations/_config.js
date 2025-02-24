import { flushSync } from 'svelte';
import { test } from '../../test';

// This test counts mutations on hydration
// set_class() should not mutate class on hydration, except if mismatch
export default test({
	mode: ['server', 'hydrate'],

	server_props: {
		browser: false
	},

	props: {
		browser: true
	},

	html: `
		<main id="main" class="browser">
			<div class="custom svelte-1cjqok6 foo bar"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>
		</main>
	`,

	ssrHtml: `
		<main id="main">
			<div class="custom svelte-1cjqok6 foo bar"></div>
			<span class="svelte-1cjqok6 foo bar"></span>
			<b class="custom foo bar"></b>
			<i class="foo bar"></i>
		</main>
	`,

	async test({ assert, component, instance }) {
		flushSync();
		assert.deepEqual(instance.get_and_clear_mutations(), ['MAIN']);

		component.foo = false;
		flushSync();
		assert.deepEqual(instance.get_and_clear_mutations(), ['DIV', 'SPAN', 'B', 'I']);
	}
});
