import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const p = target.querySelector('p');
		assert.equal(p?.innerHTML, 'hello');
		assert.equal(window.document.title, 'hello');
	}
});
