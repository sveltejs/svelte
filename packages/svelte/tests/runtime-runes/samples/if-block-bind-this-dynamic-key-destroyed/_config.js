import { flushSync } from 'svelte';
import { test } from '../../test';

// When an {#if} branch with bind:this={obj[expr]} is destroyed, bind:this
// queues a microtask to null out the binding. That teardown re-reads the
// dynamic key expression — which crashes if the reactive context is stale.
// The compiler fix captures the computed key in get_parts during the
// render_effect, so teardown uses the captured value instead.
export default test({
	html: '<span>hello</span><button>clear</button>',

	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		flushSync(() => button.click());

		// Branch immediately destroyed (no transition).
		// bind:this teardown microtask reads the dynamic key — must not crash.
		await new Promise((resolve) => setTimeout(resolve, 0));
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>clear</button>');
	}
});
