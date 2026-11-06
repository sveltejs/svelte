import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>s</button><button>u</button><button>d</button><button>resolve a</button><button>resolve b</button><button>resolve c</button><button>resolve slow</button>';

// A record of a derived that a batch computed while its view undid an assignment to the derived must
// not be used once the assignment is part of the view (here: because it was committed)
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [s, u, d, resolve_a, resolve_b, resolve_c, resolve_slow] =
			target.querySelectorAll('button');

		// batch A
		s.click();
		await tick();

		// batch B
		u.click();
		await tick();

		// batch C assigns `d`
		d.click();
		await tick();

		// B reveals the branch. Its view undoes C's assignment (and A's `s`), so it evaluates `d`
		resolve_b.click();
		await tick();
		assert.deepEqual(logs, ['slow 0']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p><span>0</span>`);

		// C commits. The assignment is part of B's view now, and still holds there
		resolve_c.click();
		await tick();
		assert.deepEqual(logs, ['slow 0', 'slow 99']);
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p><span>99</span>`);

		resolve_slow.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p><span>99</span><i>99</i>`);

		resolve_a.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p><span>99</span><i>99</i>`);
	}
});
