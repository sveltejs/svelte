import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');
		const [observations] = target.querySelectorAll('p');

		assert.equal(observations.textContent, '1');
		button.click();
		await tick();
		assert.equal(observations.textContent, '2');
	}
});
