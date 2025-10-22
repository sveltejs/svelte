import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		// We gotta wait a bit more in this test because of the macrotasks in App.svelte
		function sleep(t = 50) {
			return new Promise((r) => setTimeout(r, t));
		}

		await sleep();
		assert.htmlEqual(target.innerHTML, '<input> 1 | ');

		const [input] = target.querySelectorAll('input');

		input.value = '1';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await sleep();
		assert.htmlEqual(target.innerHTML, '<input> 1 | ');

		input.value = '12';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await sleep();
		assert.htmlEqual(target.innerHTML, '<input> 3 | 12');

		input.value = '';
		input.dispatchEvent(new Event('input', { bubbles: true }));
		await sleep();
		assert.htmlEqual(target.innerHTML, '<input> 4 | ');
	}
});
