import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		assert.htmlEqual(target.innerHTML, `<input><button>Toggle</button>`);

		assert.deepEqual(logs, [false]);

		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.deepEqual(logs, [false, true]);
	}
});
