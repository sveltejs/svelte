import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `loading`,

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, 'oops');
	}
});
