import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();

		y.click();
		await tick();
		// the new branch reads `x`, which the pending batch has written, as a new
		// dependency — the two batches entangle, so the new branch is held back
		// until the async work completes
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
		`
		);

		resolve.click();
		await tick();
		// both branches commit together, fully consistent. The init-time
		// console.logs ran eagerly (with the latest value), the $effects
		// were deferred until the commit
		assert.deepEqual(logs, ['universe', 'universe', '$effect: universe', '$effect: universe']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			universe
			universe
			universe
		`
		);
	}
});
