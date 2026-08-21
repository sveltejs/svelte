import { tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_mode: ['server'],

	ssrHtml: '<p>hello</p>',

	html: '',

	async test({ assert, target }) {
		await tick();
		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p>hello</p>');
	}
});
