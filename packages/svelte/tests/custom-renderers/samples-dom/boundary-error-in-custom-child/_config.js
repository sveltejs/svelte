import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

export default test({
	target: 'dom',
	async test({ assert, target, serialize_dom }) {
		await tick();
		assert.equal(serialize_dom(target), '<p>oops</p>');

		// the crossing was set up before the child threw, so it must already have been
		// cleaned up when the boundary replaced its content with the `failed` snippet
		assert.equal(connections.open, 0);
	}
});
