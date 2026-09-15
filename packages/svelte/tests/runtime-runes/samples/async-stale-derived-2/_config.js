import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, a, b] = target.querySelectorAll('button');

		a.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift a</button>
				<button>shift b</button>
				<p>a: 0</p>
			`
		);

		increment.click();
		await tick();

		increment.click();
		await tick();

		increment.click();
		await tick();

		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift a</button>
				<button>shift b</button>
				<p>a: 2</p>
			`
		);

		b.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift a</button>
				<button>shift b</button>
				<p>b: 3</p
			`
		);
	}
});
