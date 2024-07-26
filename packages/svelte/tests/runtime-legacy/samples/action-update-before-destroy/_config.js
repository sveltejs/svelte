import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>Click Me</button>
		<div>1</div>
	`,
	async test({ assert, target, logs }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.deepEqual(logs, ['afterUpdate', 'onDestroy']);
	}
});
