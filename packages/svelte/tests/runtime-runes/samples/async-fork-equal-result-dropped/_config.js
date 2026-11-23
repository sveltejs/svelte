import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>fork</button><button>a = 2</button><button>shift</button><button>commit</button>';

// A fork re-runs an async expression (because the real world changed its input) and the result equals
// the real value. The fork must not keep (and commit) its outdated result from before
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const [fork, a2, shift, commit] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// the fork's result is 1
		fork.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// the real world overtakes the fork's `a`, the real batch and the fork both run the expression with 2
		a2.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>0|0</span>`);

		// the real batch's result
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p><span>2|0</span>`);

		// the fork's result, which equals the real value
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p><span>2|0</span>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p><span>2|1</span>`);

		// nothing left over
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>2</p><span>2|1</span>`);
	}
});
