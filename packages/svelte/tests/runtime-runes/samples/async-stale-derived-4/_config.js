import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, hide, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();
		pop.click();
		await tick();
		hide.click(); // hides the if block, which cancels the pending async inside, which means the batch can complete
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button> <button>hide</button> <button>pop</button> 1`
		);

		pop.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button> <button>hide</button> <button>pop</button> 1`
		);
	}
});
