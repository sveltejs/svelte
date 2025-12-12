import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [reset, resolve] = target.querySelectorAll('button');

		reset.click();
		await tick();
		assert.deepEqual(logs, ['aborted']);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>reset</button>
				<button>resolve</button>
				<h1>hello</h1>
			`
		);
	}
});
