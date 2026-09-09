import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [fork, real, resolve] = target.querySelectorAll('button');

		fork.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				0
				<button>fork</button>
				<button>real</button>
				<button>resolve</button>
			`
		);
		assert.deepEqual(logs, [0]);

		real.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				1
				<button>fork</button>
				<button>real</button>
				<button>resolve</button>
			`
		);
		assert.deepEqual(logs, [0, 1]);
	}
});
