import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	// infinite loops are slow in dev mode (stack traces are captured for the updates), so only run this once
	mode: ['client'],

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
