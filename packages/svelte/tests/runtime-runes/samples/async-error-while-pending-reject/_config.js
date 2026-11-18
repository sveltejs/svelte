import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		const [shift, increment] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.equal(target.querySelector('p')?.textContent, '0');

		assert.throws(() => flushSync(() => increment.click()), /oops/);

		// the batch still has pending async work, so the rejection reaches the boundary
		shift.click();
		await tick();
		assert.equal(target.querySelector('p')?.textContent, 'failed');
	}
});
