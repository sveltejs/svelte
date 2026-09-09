import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, pop] = target.querySelectorAll('button');

		increment.click();
		await tick();
		increment.click();
		await tick();
		pop.click();
		await tick();
		assert.deepEqual(logs, ['settled 2', 'settled 2']);
		assert.htmlEqual(
			target.innerHTML,
			`
				2
				<button>increment</button>
				<button>pop</button>
			`
		);

		pop.click();
		await tick();
		assert.deepEqual(logs, ['settled 2', 'settled 2']);
		assert.htmlEqual(
			target.innerHTML,
			`
				2
				<button>increment</button>
				<button>pop</button>
			`
		);
	}
});
