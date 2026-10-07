import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [add, increment, resolve] = target.querySelectorAll('button');
		const [, p] = target.querySelectorAll('p');

		add.click();
		await tick();

		// an unrelated batch doesn't see the value the pending batch added
		increment.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 {}');

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 {"x":1}');
	}
});
