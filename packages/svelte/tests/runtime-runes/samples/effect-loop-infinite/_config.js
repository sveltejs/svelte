import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],

	compileOptions: {
		dev: true
	},

	test({ assert, errors }) {
		const [button] = document.querySelectorAll('button');

		try {
			flushSync(() => button.click());
		} catch (e) {
			assert.equal(errors.length, 1); // for whatever reason we can't get the name which should be 'updated at'
			assert.ok(/** @type {Error} */ (e).message.startsWith('effect_update_depth_exceeded'));
		}
	}
});
