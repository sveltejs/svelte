import { tick } from 'svelte';
import { connections } from '../../renderer';
import { test } from '../../test-dom.test';

export default test({
	// the same as `async-boundary-pending-custom-child`, but the boundary belongs to the
	// custom renderer, so its content is moved within the custom renderer's tree
	compileOptions: { experimental: { async: true } },
	async test({ assert, component, target, serialize }) {
		await tick();
		assert.equal(serialize(target), '<custom><p>loading</p></custom>');
		assert.equal(connections.open, 1);

		component.finish();
		await tick();
		assert.equal(
			serialize(target),
			'<custom><p>done</p> <dom-host><i>hello</i></dom-host></custom>'
		);
		assert.equal(connections.open, 1);
	}
});
