import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>fork</button><button>a = 2, b = 1</button><button>p = F</button><button>p = A</button><button>resolve b</button><button>commit</button>';

// A later batch writes `a` after the fork did, and its run of the expression resolves (to A) before the
// fork is committed. The later batch's write and result come after the fork's, so they stay the real-world
// values: the fork commits its own view (`a = 1`, F), and the later batch keeps its own `a = 2` and result,
// and commits them once it's done
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

		// the later batch is done
		rb.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>A</p><i>b1</i><span>2|1</span>`);
	}
});
