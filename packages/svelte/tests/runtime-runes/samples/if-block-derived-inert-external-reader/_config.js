import { flushSync } from 'svelte';
import { test } from '../../test';

// Covers the INERT (outroing) counterpart to if-block-const-destroyed-external-reader.
// An external $derived reads a child component's $derived via bind:this, keeping it
// connected in the reactive graph while the branch is outroing. Without a guard,
// the inner derived re-evaluates with stale values mid-transition and crashes.
// The fix returns the cached value and keeps the derived dirty so it re-evaluates
// correctly if the branch reverses (INERT cleared) rather than being stuck with
// a stale clean value.
export default test({
	ssrHtml: '<div></div><button>clear</button><p></p>',
	html: '<div></div><button>clear</button><p>HELLO</p>',

	async test({ assert, raf, target }) {
		const [button] = target.querySelectorAll('button');

		// Clearing value starts the out-transition (branch becomes INERT).
		// Without the guard this crashes with a TypeError in async mode.
		flushSync(() => button.click());

		assert.htmlEqual(
			target.innerHTML,
			'<div style="opacity: 0;"></div><button>clear</button><p>HELLO</p>'
		);

		// Complete the transition — branch is now destroyed and div is removed.
		raf.tick(100);

		// Flush the bind:this teardown microtask and resulting effect updates.
		await Promise.resolve();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>clear</button><p></p>');
	}
});
