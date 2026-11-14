import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, open, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();

		open.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>open</button>
				<button>resolve</button>
				<p>doubled 0, count 0</p>
			`
		);

		resolve.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>open</button>
				<button>resolve</button>
				<p>2</p>
				<p>doubled 2, count 1</p>
			`
		);
	}
});
