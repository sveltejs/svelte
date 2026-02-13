import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<div><div>foo</div></div>');
	}
});
