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
		// the new branch's reads of `x` are new dependencies on a value the
		// pending batch has written, so they see the latest value ('universe') —
		// including the init-time console.log, which runs outside a reaction
		assert.deepEqual(logs, ['universe', 'universe', '$effect: universe']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>x</button>
			<button>y++</button>
			<button>resolve</button>
			universe
		`
		);

		resolve.click();
		await tick();
		// the second child's $effect already saw the committed value, so it does not re-run
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
