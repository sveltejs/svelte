import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target }) {
		const select = target.querySelector('select');
		ok(select);
		const [option1, option2] = select;

		assert.ok(option1.selected);
		assert.ok(!option2.selected);

		const btn = target.querySelector('button');
		flushSync(() => {
			btn?.click();
		});
		assert.ok(option1.selected);
		assert.ok(!option2.selected);
	}
});
