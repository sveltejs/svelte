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
		const [b, l, resolve_b, resolve_l] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 0</span>`);
		logs.length = 0;

		b.click();
		await tick();
		l.click();
		await tick();
		assert.deepEqual(logs, ['g 1', 'x 1', 'x 2']);

		// B commits, and L starts the async work for the new `v` right away
		resolve_b.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 1</span>`);
		assert.deepEqual(logs, ['g 1', 'x 1', 'x 2', 'v 1']);

		resolve_l.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<span>x: 2</span><p>v: 1</p><p>v: 1</p>`);
	}
});
