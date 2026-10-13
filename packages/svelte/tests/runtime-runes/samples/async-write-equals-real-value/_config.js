import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>b</button><button>z</button><button>shift</button>';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [b, z, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>0</p><p>a</p>${buttons}`);
		assert.deepEqual(logs, ['fetch a']);

		// write x = 'b' — the batch is pending on its async expression
		b.click();
		await tick();
		assert.deepEqual(logs, ['fetch a', 'fetch b']);

		// an independent batch runs the effect, which writes x = 'b' — the
		// real value is already 'b', so this is a no-op: the async expression
		// must not re-run (no needless refetch), and the batch must not be
		// entangled with the pending one (z commits immediately)
		z.click();
		await tick();
		assert.deepEqual(logs, ['fetch a', 'fetch b']);
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>a</p>${buttons}`);

		// the pending batch settles
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.deepEqual(logs, ['fetch a', 'fetch b']);
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>b</p>${buttons}`);
	}
});
