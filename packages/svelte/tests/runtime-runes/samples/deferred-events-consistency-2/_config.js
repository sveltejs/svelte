import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // need to make a browser test of this because calling click() sync will not let Svelte yield

	async test({ assert, target, logs }) {
		const [b1] = target.querySelectorAll('button');
		b1.click();
		flushSync();

		assert.deepEqual(logs, ['http://localhost:3000/new%20url']);
	}
});
