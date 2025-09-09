import { settled } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_mode: ['hydrate', 'server'],

	html: `
		<p>hello</p>
	`,

	async test({ assert, target }) {
		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p>Loading...</p>');

		const p2 = target.querySelector('p');
		ok(p2);
		assert.htmlEqual(p2.outerHTML, '<p>hello</p>');
	}
});
