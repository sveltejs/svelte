import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>z</button><button>w</button><button>shift</button>';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [z, w, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>true</p><p>0</p>${buttons}`);
		assert.deepEqual(logs, ['eval true']);

		// with no other batch pending, the equality cut-off works: `c`
		// recomputes to the same value, the template expression is not
		// re-evaluated
		z.click();
		await tick();
		assert.deepEqual(logs, ['eval true']);

		// write w — the batch is pending on its async expression
		w.click();
		await tick();
		assert.deepEqual(logs, ['eval true']);

		// z++ recomputes `c` to the same value again — the template expression
		// should still not be re-evaluated, even though another batch is pending
		z.click();
		await tick();
		assert.deepEqual(logs, ['eval true']);

		// the pending batch settles — nothing `c` depends on changed
		shift.click();
		await tick();
		assert.deepEqual(logs, ['eval true']);
		assert.htmlEqual(target.innerHTML, `<p>true</p><p>1</p>${buttons}`);
	}
});
