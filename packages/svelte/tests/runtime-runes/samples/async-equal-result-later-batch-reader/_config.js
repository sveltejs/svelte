import { tick } from 'svelte';
import { test } from '../../test';

const buttons =
	'<button>b = 1</button><button>b = 2, c = 1</button><button>resolve latest pos</button><button>resolve oldest pos</button><button>resolve all</button>';

// Like `async-equal-result-dropped-later-batch`, but the result is read by something that doesn't wait
// for it: a batch's async result equals the real value, which a later (still pending) batch wrote. The
// batch itself sees that later batch's previous value though, so the result changes its world, and
// whatever read the previous value has to update
export default test({
	mode: ['client'],
	async test({ assert, target }) {
		await tick();
		const [b1, b2c1, resolve_latest, resolve_oldest, resolve_all] =
			target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `${buttons}<p>zero</p><span>0</span><i>c0</i>`);

		b1.click();
		await tick();
		b2c1.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>zero</p><span>0</span><i>c0</i>`);

		// the later batch's result becomes the real value, but that batch still waits for c1
		resolve_latest.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>zero</p><span>0</span><i>c0</i>`);

		// the earlier batch's equal result completes it
		resolve_oldest.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>pos</p><span>1</span><i>c0</i>`);

		resolve_all.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `${buttons}<p>pos</p><span>2</span><i>c1</i>`);
	}
});
