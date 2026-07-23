import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>count</button><button>eager</button><button>shift</button>';

export default test({
	// running more than once per bump
	async test({ assert, target, logs }) {
		await tick();
		const [count, eager, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>-1</p>${buttons}`);
		assert.deepEqual(logs, []);

		// count++ creates a pending batch; the inner block (containing the
		// $state.eager expression) is created inside it and belongs to it.
		// it does not depend on `count`
		count.click();
		await tick();
		assert.deepEqual(logs, ['inner 0']);

		// an eager version bump re-runs the inner block in the eager batch's
		// world — since the block doesn't depend on the pending batch's
		// changes, it sees exactly the same values the owner's world would
		eager.click();
		await tick();
		assert.deepEqual(logs, ['inner 0', 'inner 1']);

		// the pending batch settles — nothing the inner block sees has
		// changed since its eager run, so it should not be re-run
		shift.click();
		await tick();
		assert.deepEqual(logs, ['inner 0', 'inner 1']);
		assert.htmlEqual(target.innerHTML, `<p>0</p><span>1</span>${buttons}`);
	}
});
