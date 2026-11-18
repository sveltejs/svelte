import { tick } from 'svelte';
import { test } from '../../test';

const buttons = '<button>b</button><button>reset</button><button>shift</button>';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [b, reset, shift] = target.querySelectorAll('button');

		assert.htmlEqual(target.innerHTML, `<p>0</p><p>a</p>${buttons}`);
		assert.deepEqual(logs, ['fetch a']);

		// write x = 'b' — the batch is pending on its async expression
		b.click();
		await tick();
		assert.deepEqual(logs, ['fetch a', 'fetch b']);

		// an independent batch runs the effect, which resets x = 'a'. The real
		// (pending) value is 'b', so this is a genuine change and must not be
		// swallowed just because the effect's world still shows 'a'
		reset.click();
		await tick();
		assert.deepEqual(logs, ['fetch a', 'fetch b', 'fetch a']);

		// resolve all in-flight runs — the reset must win
		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, `<p>1</p><p>a</p>${buttons}`);
	}
});
