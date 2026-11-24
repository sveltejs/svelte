import { tick } from 'svelte';
import { test } from '../../test';

// https://github.com/sveltejs/svelte/issues/19340
export default test({
	mode: ['hydrate'],
	server_props: { browser: false },
	props: { browser: true },
	async test({ assert, target, mod, hydrate }) {
		mod.params.id = 'ada';
		hydrate();
		await tick();
		await tick();

		// An unrelated state change while hydration is still pending must not see the state
		// that hydration ran with undone (`params.id`, and the query's lazily written promise)
		mod.other.n++;
		await tick();
		await tick();

		mod.slow.resolve('loaded');
		await tick();
		await tick();

		assert.htmlEqual(target.innerHTML, '<p>ada</p><p>Hello ada: loaded</p>');
		// The query was seeded with what the server rendered, so it never needs to be requested
		assert.deepEqual(mod.requests, []);
	}
});
