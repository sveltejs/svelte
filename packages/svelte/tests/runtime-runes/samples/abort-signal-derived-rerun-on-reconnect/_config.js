import { test } from '../../test';
import { tick } from 'svelte';

export default test({
	async test({ assert, target }) {
		const [increment, toggle, resolve] = target.querySelectorAll('button');
		const [div] = target.querySelectorAll('div');

		assert.htmlEqual(div.innerHTML, 'loading');
		resolve.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '0');

		increment.click();
		await tick();
		assert.htmlEqual(div.innerHTML, 'loading');

		toggle.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '');

		toggle.click();
		await tick();
		assert.htmlEqual(div.innerHTML, 'loading');

		resolve.click(); // this one's for clearing the obsolete/aborted one from the queue
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '2');
	}
});
