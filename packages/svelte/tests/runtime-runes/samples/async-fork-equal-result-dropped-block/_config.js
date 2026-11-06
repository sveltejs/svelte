import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>fork</button><button>a = 2</button><button>shift</button><button>commit</button>';

// Like `async-fork-equal-result-dropped`, but a block depends on the async expression: the fork's
// re-run result equals the real value, but differs from the fork's outdated one, so the block has to
// update in the fork (its effects are considered up to date with the fork once it is committed)
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, a2, shift, commit] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>0|0</span>`);

		// the fork's result is 1
		fork.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>0|0</span>`);

		// the real world overtakes the fork's `a`, the real batch and the fork both run the expression with 2
		a2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>0|0</span>`);

		// the real batch's result
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>2|0</span>`);

		// the fork's result, which equals the real value
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>2|0</span>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>2|1</span>`);

		// nothing left over
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>other</p><span>2|1</span>`);
	}
});
