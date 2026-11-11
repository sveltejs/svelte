import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>c</button>
	<button>a</button>
	<button>shift</button>
`;

// An earlier batch (B, which sets `c`) reveals a branch that a later batch (A) created, and whose content A is
// still creating.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [c, a, shift] = target.querySelectorAll('button');
		assert.deepEqual(logs.splice(0), ['c 0', 'commit c=0 a=false x=0']);

		c.click();
		await tick();
		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['c 1', 'y 1', 'x 1']);

		// B's `c` result: B reveals the branch, and runs its expression
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);
		assert.deepEqual(logs.splice(0), ['x 0']);

		// A's `y`
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, buttons);

		// A's `x`: A is merged into B, which commits both
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<i>1</i><p>1 1</p>`);
		assert.deepEqual(logs.splice(0), ['commit c=1 a=true x=1']);
	}
});
