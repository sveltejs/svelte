import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	ssrHtml: `<p>s1</p>`,

	async test({ assert, target, variant }) {
		await tick();
		assert.htmlEqual(target.innerHTML, variant === 'hydrate' ? '<p>s1</p>' : '<p>c1</p>');
	}
});
