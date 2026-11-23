import { tick } from 'svelte';
import { test } from '../../test';

// Tests that a newly created batch during an effect flush isn't rebased right away by the previous batch.#commit(),
// rescheduling an effect on the new batch that shouldn't run.
export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, unrelated, resolve] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.deepEqual(logs, []);

		// This resolve
		// - shouldn't result in the derived execution capturing the new derived value on the new batch, but on the previous batch which is currently flushing
		// - shouldn't result in #commit() rebasing the new batch
		resolve.click();
		await tick();
		assert.deepEqual(logs, [2]);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>count 1 | count_mirror 0 | count_mirror_d 0 | unrelated 0</button>
				<button>unrelated++</button>
				<button>resolve</button>
			`
		);

		// This resolve
		// - shouldn't result in the derived execution capturing the new derived value on the new batch, but on the previous batch which is currently flushing
		// - shouldn't result in #commit() rebasing the new batch
		unrelated.click();
		await tick();
		assert.deepEqual(logs, [2]);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>count 1 | count_mirror 0 | count_mirror_d 0 | unrelated 1</button>
				<button>unrelated++</button>
				<button>resolve</button>
			`
		);

		// As a result, this resolve shouldn't result in another execution of the effect depending on the derived
		resolve.click();
		await tick();
		assert.deepEqual(logs, [2]);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>count 1 | count_mirror 1 | count_mirror_d 2 | unrelated 1</button>
				<button>unrelated++</button>
				<button>resolve</button>
			`
		);
	}
});
