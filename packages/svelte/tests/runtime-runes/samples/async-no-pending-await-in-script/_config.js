import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_mode: ['server'],

	ssrHtml: '<p>hello</p>',

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>hello</p>');
	}
});
