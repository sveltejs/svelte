import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>assign</button><button>u</button><button>d</button><button>resolve b</button><button>resolve c</button>';

// Like async-derived-assign-previous-assigned, but batch C writes `s` before it assigns `d` again. In the
// real world that ends the assignment of 5, but B's view undoes C's writes, so there it still holds
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [assign, u, d, resolve_b, resolve_c] = target.querySelectorAll('button');

		// commits right away
		assign.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>5</span>`);

		// batch B
		u.click();
		await tick();

		// batch C assigns `d` again
		d.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>5</span>`);

		// B's view undoes C's assignment. Before it, `d` was assigned 5, which still holds
		resolve_b.click();
		await tick();
		assert.deepEqual(logs, ['probe 5', 'probe 99']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><span>5</span><i>5</i>`);

		resolve_c.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>99</span><i>99</i>`);
	}
});
