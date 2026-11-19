import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

export default test({
	// while the boundary is pending, its content (including the crossing's host node)
	// is moved into an offscreen fragment, and moved back once it resolves
	target: 'dom',
	compileOptions: { experimental: { async: true } },
	async test({ assert, component, target, serialize_dom }) {
		await tick();
		assert.equal(serialize_dom(target), '<p>loading</p>');
		assert.equal(connections.open, 1);

		component.finish();
		await tick();
		assert.equal(serialize_dom(target), '<p>done</p> <custom-root><b>hello</b></custom-root>');
		// the crossing was moved, not recreated
		assert.equal(connections.open, 1);
	}
});
