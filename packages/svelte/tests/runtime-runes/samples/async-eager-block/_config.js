import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>increment</button> <button>resolve</button> 0 <p>loading...</p>'
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>increment</button> <button>resolve</button> 1 <p>1</p>'
		);
	}
});
