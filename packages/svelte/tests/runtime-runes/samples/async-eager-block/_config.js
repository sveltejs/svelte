import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>increment</button> <button>resolve</button> 0 <p>loading...</p> <p>1</p>' // <p>0</p> would also be ok here
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>increment</button> <button>resolve</button> 1 <p>1</p> <p>1</p>'
		);
		assert.deepEqual(logs, [0, 1]);
	}
});
