import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	compileOptions: {
		dev: true
	},

	test({ assert, errors }) {
		const [button] = document.querySelectorAll('button');

		assert.throws(() => {
			flushSync(() => button.click());
		}, /effect_update_depth_exceeded/);

		assert.equal(errors.length, 1);

		assert.doesNotThrow(flushSync);
	}
});
