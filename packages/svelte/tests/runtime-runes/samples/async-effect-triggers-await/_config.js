import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>1</p>
				<p>1</p>
			`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>2</p>
				<p>2</p>
			`
		);
	}
});
