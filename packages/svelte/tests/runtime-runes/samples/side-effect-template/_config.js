import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target }) {
		const button = target.querySelector('button');

		assert.throws(() => {
			button?.click();
			flushSync();
		}, /state_unsafe_mutation/);
	}
});
