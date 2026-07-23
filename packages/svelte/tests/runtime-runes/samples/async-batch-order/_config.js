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
		// all three increments write `a` and therefore share the async work —
		// they are merged into a single batch in which the first two in-flight
		// runs are superseded, so resolving the second one does nothing
		middle.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '0 0 0');

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
