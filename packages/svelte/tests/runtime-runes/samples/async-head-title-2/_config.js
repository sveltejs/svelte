import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [toggle, resolve] = target.querySelectorAll('button');
		toggle.click();
		await tick();
		assert.equal(window.document.title, '');

		toggle.click();
		await tick();
		assert.equal(window.document.title, '');

		toggle.click();
		await tick();
		assert.equal(window.document.title, '');

		resolve.click();
		await tick();
		assert.equal(window.document.title, 'title');
	}
});
