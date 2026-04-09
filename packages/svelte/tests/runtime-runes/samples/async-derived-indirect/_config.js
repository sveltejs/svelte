import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [a, b, resolve] = target.querySelectorAll('button');

		a.click();
		await tick();
		b.click();
		await tick();
		resolve.click();
		await tick();
		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
                <button>a</button>
                <button>b</button>
                <button>resolve</button>
				hi
                1
            `
		);
	}
});
