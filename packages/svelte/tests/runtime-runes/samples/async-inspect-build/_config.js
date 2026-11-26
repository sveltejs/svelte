import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: 'works',
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, 'works');
	}
});
