import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>B</button><button>L</button><button>resolve B</button><button>resolve L</button>';

// L's writes (`x`) are all among those of B (`x`, `y`), which commits first. B's async results arrive after L
// created a branch in its view, so L must be rebased when B commits — otherwise it only notices the new `v` when
// it is processed next, and the async work in the block that depends on it starts late
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, resolve_a, resolve_b] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 0</span>`);
		logs.length = 0;

		a.click();
		await tick();
		b.click();
		await tick();
		assert.deepEqual(logs, ['y 1', 'x 1', 'x 2']);

		// A commits, and L starts the async work for the new `z` right away
		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 1</span>`);
		assert.deepEqual(logs, ['y 1', 'x 1', 'x 2', 'z 1']);

		resolve_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 2</span><p>z: 1</p><p>z: 1</p>`);
	}
});
