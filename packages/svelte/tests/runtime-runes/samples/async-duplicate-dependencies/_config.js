import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		increment.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>resolve</button>
				4
			`
		);

		increment.click();
		await tick();
		increment.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>resolve</button>
				8
			`
		);
	}
});
