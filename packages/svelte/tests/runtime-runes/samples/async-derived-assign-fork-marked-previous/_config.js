import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>assign</button><button>fork</button><button>x</button><button>y</button><button>shift</button>';

// A fork's write marks an assigned derived dirty, but doesn't make the assignment outdated in the real world.
// So when the derived is assigned again, the assignment is the value from before, which views that undo
// the new assignment see
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [assign, f, x, y, shift] = target.querySelectorAll('button');

		assign.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0 100</p>`);

		f.click();
		await tick();

		// batch A
		x.click();
		await tick();

		// batch B assigns again
		y.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0 0 100</p>`);

		// A's view undoes B's assignment
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 0 100</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1 1 200</p>`);
	}
});
