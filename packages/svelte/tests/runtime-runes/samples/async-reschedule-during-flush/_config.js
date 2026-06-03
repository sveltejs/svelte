import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, b, resolve] = target.querySelectorAll('button');

		a.click();
		await tick();

		b.click();
		await tick();

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a (true)</button>
				<button>b (true)</button>
				<button>resolve</button>
				42
			`
		);
	}
});
