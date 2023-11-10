import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	get props() {
		return { log: [] };
	},

	async test({ assert, target, component }) {
		const [b1] = target.querySelectorAll('button');
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		flushSync(() => {
			b1.click();
		});
		assert.deepEqual(component.log, [0, 2, 4]);
	}
});
