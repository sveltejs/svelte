import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		accessors: false
	},
	test({ assert, target, logs }) {
		const button = target.querySelector('button');
		flushSync(() => button?.click());

		assert.deepEqual(logs, [
			'value = true, other = true',
			'track = 0, thing1 = false, thing2 = false, derived = false',
			'tracked derived = true',
			'tracked derived = false'
		]);
	}
});
