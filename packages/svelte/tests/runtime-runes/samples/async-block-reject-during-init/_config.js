import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, 'loading');
		await tick();
		assert.htmlEqual(target.innerHTML, 'nope');
	}
});
