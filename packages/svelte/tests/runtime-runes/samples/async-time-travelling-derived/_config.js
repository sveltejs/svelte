import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [a, b, update] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>0</button>
				<h1>a</h1>
			`
		);

		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>0</button>
				<h1>b</h1>
			`
		);

		update.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>1</button>
				<h1>b</h1>
			`
		);

		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>1</button>
				<h1>a</h1>
			`
		);
	}
});
