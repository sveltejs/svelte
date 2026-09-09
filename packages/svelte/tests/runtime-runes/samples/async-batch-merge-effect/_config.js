import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [x, x_y, pop] = target.querySelectorAll('button');

		x.click();
		await tick();
		x_y.click();
		await tick();
		pop.click();
		await tick();
		pop.click();
		await tick();
		pop.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			'<button>x</button> <button>x/y</button> <button>pop</button> 2 1 1'
		);
	}
});
