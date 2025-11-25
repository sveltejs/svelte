import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['server'],

	ssrHtml: '1-Rich',

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '1-Rich');
	}
});
