import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [fork] = target.querySelectorAll('button');

		fork.click();
		await tick();

		const [, increment] = target.querySelectorAll('button');
		const p = target.querySelector('p');

		assert.equal(p?.textContent, '0');

		increment.click();
		await tick();

		assert.equal(p?.textContent, '1');
	}
});
