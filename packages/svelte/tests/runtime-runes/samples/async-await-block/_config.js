import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>1</p>');
	}
});
