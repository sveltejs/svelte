import { tick } from 'svelte';
import { test } from '../../test';

// End-to-end check that blocker propagation through `trace_references` still
// produces correct output when a function reaches its blocked bindings through
// chained assignments, an assignment cycle, repeated references, and a returned
// closure. If the shared-`seen` traversal dropped any reached binding, the
// template would render before its awaited value settled.
export default test({
	mode: ['async-server', 'client', 'hydrate'],
	ssrHtml: '<p>a-aaaa-b</p> <p>b</p>',

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>a-aaaa-b</p> <p>b</p>');
	}
});
