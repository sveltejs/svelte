import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [incremet, resolve] = target.querySelectorAll('button');

		incremet.click();
		await tick();
		incremet.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>increment</button> <button>resolve</button> 4 4 1');
	}
});
