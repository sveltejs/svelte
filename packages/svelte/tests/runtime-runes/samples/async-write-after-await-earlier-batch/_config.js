import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>show</button><button>x = 2</button><button>shift</button><button>pop</button><button>y++</button>';

// A component's script continues in the batch that created it after a top-level `await`. A write there
// belongs to that (earlier) batch, so it must not overwrite the value of a later batch that wrote the same
// state — just like it wouldn't if everything were synchronous (the child would set `x = 1` on mount, before
// the click sets `x = 2`)
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [show, x2, shift, pop, y] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// batch 1 mounts the child, which awaits
		show.click();
		await tick();

		// batch 2 writes x and awaits delay(2)
		x2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// the child continues in batch 1 and writes x = 1, which makes batch 1 await delay(1)
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// batch 1 commits
		pop.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>child</i><p>1</p><span>1|0</span>`);

		// batch 2 commits
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>child</i><p>2</p><span>2|0</span>`);

		y.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>child</i><p>2</p><span>2|1</span>`);
	}
});
