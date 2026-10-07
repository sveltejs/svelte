import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [add, increment, resolve] = target.querySelectorAll('button');
		const [, p] = target.querySelectorAll('p');

		add.click();
		await tick();

		// an unrelated batch still sees callable `map` and iterator while the pending batch assigns them
		increment.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '2,3 1,1,2');

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '2,3 1,1,2');
	}
});
