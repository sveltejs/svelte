import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [increment, shift, middle] = target.querySelectorAll('button');
		const [div] = target.querySelectorAll('div');

		increment.click();
		await tick();
		increment.click();
		await tick();
		increment.click();
		await tick();
		middle.click(); // resolve the second increment which will make the if block go away and the first batch discarded
		await tick();
		assert.htmlEqual(div.innerHTML, '2 2');

		shift.click();
		await tick();
		shift.click();
		await tick();
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '3 3');
	}
});
