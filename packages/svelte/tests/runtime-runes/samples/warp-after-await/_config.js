import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	skip_mode: ['server'],
	async test({ assert, window }) {
		await tick();
		const h1 = window.document.querySelector('h1');
		assert.equal(h1?.textContent, 'hello after await');
	}
});
