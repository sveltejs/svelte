import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	async test({ assert, target }) {
		await tick();
		const [show, update, hide, first, second] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'pending: 0');

		show.click();
		await tick();
		update.click();
		await tick();

		// The later batch's result must wait for the initialization script's first value.
		second.click();
		await tick();
		assert.notEqual(output.textContent, 'pending: 0');

		hide.click();
		await tick();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending: 0');
		assert.equal(target.querySelector('p'), null);

		// Teardown must release pending work even while the first promise is unresolved.
		// Its eventual settlement must not decrement again or resurrect the branch.
		first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, 'pending: 0');
		assert.equal(target.querySelector('p'), null);
	}
});
