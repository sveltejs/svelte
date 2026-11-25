import { flushSync } from 'svelte';
import { test } from '../../suite';

export default test({
	test({ assert, instance, platform_root }) {
		const mesh = /** @type {import('../../platform').PElement} */ (platform_root.children[0]);

		// values reach the platform as they are, not as strings
		assert.deepEqual(mesh.props.position, [1, 2, 3]);

		instance.move();
		flushSync();
		assert.deepEqual(mesh.props.position, [4, 5, 6]);
	}
});
