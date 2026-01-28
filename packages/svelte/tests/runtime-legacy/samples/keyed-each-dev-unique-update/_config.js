import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target }) {
		let button = target.querySelector('button');

		button?.click();

		assert.throws(flushSync, /each_key_duplicate/);
	}
});
