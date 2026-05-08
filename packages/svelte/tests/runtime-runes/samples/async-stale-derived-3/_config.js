import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button><button>pop</button><p>0 0 0</p>`
		);

		pop.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button><button>pop</button><p>2 2 1</p>`
		);
	}
});
