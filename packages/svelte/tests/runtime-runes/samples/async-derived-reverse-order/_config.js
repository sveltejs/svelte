import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();

		pop.click();
		await tick();

		pop.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>pop</button>
				<p>1</p>
			`
		);

		increment.click();
		await tick();

		pop.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>pop</button>
				<p>2</p>
			`
		);
	}
});
