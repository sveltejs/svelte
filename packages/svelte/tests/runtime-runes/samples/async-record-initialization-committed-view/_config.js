import { tick } from 'svelte';
import { test } from '../../test';

// A committed with its boundary pending. B writes count = 1 but cannot commit yet.
// A's script then resumes in its committed view and initializes held with count = 0,
// not the latest source value. Once B commits, its held = 1 run must supersede A's.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [update, first, finish_update, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		await tick();
		assert.htmlEqual(output.innerHTML, '<b>0</b><p>pending</p>');

		update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<b>0</b><p>pending</p>');
		assert.deepEqual(logs, []);

		first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<b>0</b><p>pending</p>');
		// Both attempts await this user promise, then initialize in their own view.
		// B's private load(1) must not expose its uncommitted count in A's output.
		assert.deepEqual(logs, [0, 1]);

		finish_update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<b>1</b><p>pending</p><i>1</i>');
		assert.deepEqual(logs, [0, 1]);

		// Resolve both runs in creation order. The old result must not replace B's.
		resolve.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<b>1</b><p>one 1</p><i>1</i>');
		assert.deepEqual(logs, [0, 1]);
	}
});
