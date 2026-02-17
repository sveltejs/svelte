import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	mode: ['client'],

	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();

		assert.throws(flushSync, /each_key_volatile/);
	}
});
