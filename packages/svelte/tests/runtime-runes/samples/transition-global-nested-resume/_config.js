import { flushSync } from 'svelte';
import { test } from '../../test';

// #15604 — an element mid-outro must not be resurrected when an ancestor
// block is paused and resumed while the element's own condition is still false.
// The outer `transition:fade` matters: it keeps the outer branch alive (pending
// its own outro) so that toggling back takes the resume path
export default test({
	test({ assert, target, raf }) {
		const [hide, fetch] = target.querySelectorAll('button');

		// let the mount intro (dom variant) finish
		raf.tick(200);
		assert.ok(target.querySelector('.red'));

		// start the outro of the inner block
		flushSync(() => hide.click());

		// pause the outer block while the outro is in flight...
		flushSync(() => fetch.click());
		raf.tick(250);

		// ...then resume it before either outro completes
		flushSync(() => fetch.click());
		raf.tick(2000);

		assert.equal(target.querySelector('.red'), null);
	}
});
