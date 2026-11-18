import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [x, y, resolve] = target.querySelectorAll('button');

		x.click();
		await tick();
		assert.deepEqual(logs, ['universe']);

		y.click();
		await tick();
		// the new branch reads `x`, which the pending batch has written, as a new
		// dependency. Batches are independent: the `y` batch sees `x` without the
		// pending batch's write (i.e. `undefined`), and since it has no async work
		// of its own it commits right away, showing its consistent view of the world
		assert.deepEqual(logs, ['universe', undefined, '$effect: undefined']);
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
		// the `x` batch commits on top of the `y` batch: the first branch appears
		// and the already visible `Child` updates, fully consistent
		assert.deepEqual(logs, [
			'universe',
			undefined,
			'$effect: undefined',
			'$effect: universe',
			'$effect: universe'
		]);
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
