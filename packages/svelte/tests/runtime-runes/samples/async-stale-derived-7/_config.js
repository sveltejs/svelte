import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [button1, button2, shift_1, pop_1, shift_2] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		button1.click();
		await tick();
		button2.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		pop_1.click();
		await tick();
		shift_2.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `0 + 0 = 0 | 0 0`);

		// Check that the first batch can still resolve before the second even if one of its async values
		// is already superseeded (but the subsequent batch as a whole is still pending).
		shift_1.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `1 + 0 = 1 | 1 0`);

		shift_1.click();
		await tick();
		shift_2.click();
		await tick();
		assert.htmlEqual(p.innerHTML, `1 + 2 = 3 | 1 1`);
	}
});
