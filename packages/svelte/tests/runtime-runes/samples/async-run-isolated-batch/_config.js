import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [show, resolve, count] = target.querySelectorAll('button');

		show.click();
		await tick();
		resolve.click();
		await tick();
		count.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>show</button> <button>resolve</button> <button>1</button>'
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'1 2 <button>show</button> <button>resolve</button> <button>1</button>'
		);
	}
});
