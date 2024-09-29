import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [my_element, my_element_1] = target.querySelectorAll('my-element');
		assert.equal(my_element.classList.contains('svelte-1koh33s'), true);
		assert.equal(my_element_1.classList.contains('svelte-1koh33s'), true);
	}
});
