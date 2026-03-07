import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>pending</p>
	`,

	async test({ assert, target }) {
		await tick();
		assert.htmlEqual(target.innerHTML, '<p data-foo="bar">hello</p>');
	}
});
