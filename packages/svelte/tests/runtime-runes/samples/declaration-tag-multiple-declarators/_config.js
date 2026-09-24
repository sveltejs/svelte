import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>increment</button><p>count: 0</p><p>doubled: 0</p><p>quadrupled: 0</p>`,
	async test({ assert, target }) {
		const [button] = target.querySelectorAll('button');

		button.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button><p>count: 1</p><p>doubled: 2</p><p>quadrupled: 4</p>`
		);
	}
});
