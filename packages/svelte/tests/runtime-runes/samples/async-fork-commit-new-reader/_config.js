import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>u</button><button>fork</button><button>cond</button><button>commit</button><button>shift</button>';

// The template effect is deferred by the fork (it depends on `s` via `big`), but before the
// fork is committed, it re-runs in the real world and starts reading `s` directly.
// Committing the fork (while another batch is pending) must still update it.
export default test({
	async test({ assert, target }) {
		await tick();
		const [u, f, cond, commit, shift] = target.querySelectorAll('button');

		// unrelated pending batch
		u.click();
		await tick();

		f.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>false</p>`);

		cond.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>0</p>`);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p><p>1</p>`);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><p>1</p>`);
	}
});
