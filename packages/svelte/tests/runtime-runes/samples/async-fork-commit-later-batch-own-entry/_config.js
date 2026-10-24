import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>fork</button><button>a = 2, b = 1</button><button>p = F</button><button>p = A</button><button>resolve b</button><button>commit</button>';

// Committing a fork writes its values to the real world, even where a later batch has its own entry. When
// that batch then re-runs the async expression and it resolves to the batch's own (now outdated) value
// again, the result must still be applied, rather than being dropped as unchanged
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, a2b1, pF, pA, rb, commit] = target.querySelectorAll('button');

		pA.click();
		await tick();
		rb.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>A</p><i>b0</i><span>0|0</span>`);

		// the fork's result is F
		fork.click();
		await tick();
		pF.click();
		await tick();

		// the later batch's result is A (it still waits for b)
		a2b1.click();
		await tick();
		pA.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>A</p><i>b0</i><span>0|0</span>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>F</p><i>b0</i><span>1|0</span>`);

		// the later batch re-runs the expression...
		rb.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>F</p><i>b0</i><span>1|0</span>`);

		// ...which resolves to A again
		pA.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>A</p><i>b1</i><span>1|1</span>`);
	}
});
