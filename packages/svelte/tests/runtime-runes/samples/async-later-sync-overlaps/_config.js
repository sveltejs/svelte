import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a_b, b, resolve] = target.querySelectorAll('button');

		a_b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a_b 0_0</button> <button>b 0</button> <button>resolve</button> 0'
		);

		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a_b 0_0</button> <button>b 0</button> <button>resolve</button> 0'
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>a_b 1_2</button> <button>b 2</button> <button>resolve</button> 1'
		);
	}
});
