import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>1 ** 2 = 1</p>
				<p>1 ** 3 = 1</p>
				<p>function function</p>
				<p>1 2</p>
			`
		);

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>2 ** 2 = 4</p>
				<p>2 ** 3 = 8</p>
				<p>function function</p>
				<p>1 2</p>
			`
		);
	}
});
