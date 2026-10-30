import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>a</button><button>b</button><button>f first</button><button>f last</button><button>g</button>';

// An async expression that rejects in an earlier batch, after a later batch wrote its own result for
// it, is an error in the earlier batch's view — like any other result that isn't the latest value.
// Before, errors were always written to the real world but never to the batch, so the earlier batch's
// view undid the later batch's write and committed `a=1` next to the result for `a=0`
export default test({
	async test({ assert, target }) {
		const [a, b, f_first, f_last, g] = target.querySelectorAll('button');

		f_first.click();
		await tick();
		g.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a=0 f=0/0</p><i>0</i>`);

		// batch A: f(1, 0), which rejects
		a.click();
		await tick();

		// batch B: f(0, 1) and g(1) — in B's view, A's write to `a` is undone
		b.click();
		await tick();

		// B's f resolves first, so its result is the latest value. B still waits for g
		f_last.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>a=0 f=0/0</p><i>0</i>`);

		// A's f rejects
		f_first.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons} failed: boom`);
	}
});
