import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ target, assert }) {
		await tick();
		const [element] = target.querySelectorAll('async-custom-element');

		assert.htmlEqual(element.innerHTML, `Hello foobar!`);
	}
});
