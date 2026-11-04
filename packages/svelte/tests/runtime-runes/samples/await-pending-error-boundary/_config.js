import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>failed: pending error</p>');
	}
});
