import { flushSync, settled } from 'svelte';
import { ok, test } from '../../test';

export default test({
	skip_mode: ['hydrate', 'server'],

	html: `
		<p>hello</p>
	`,

	async test({ assert, target, variant }) {
		if (variant === 'dom') {
			await settled();
		}
		const p = target.querySelector('p');
		ok(p);
		assert.htmlEqual(p.outerHTML, '<p>Loading...</p>');

		await settled();
		flushSync();
		assert.htmlEqual(p.outerHTML, '<p>hello</p>');
	}
});
