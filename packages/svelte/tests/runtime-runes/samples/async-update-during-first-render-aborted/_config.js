import { tick } from 'svelte';
import { test } from '../../test';

// Like `async-update-during-first-render`, but the update aborts the original run.
// The script must continue with the update's value. The update must merge into the creating batch
// despite their nonintersecting writes, so both batches can finish.
export default test({
	mode: ['client'],
	async test({ assert, target, instance, logs }) {
		await tick();
		instance.bump();
		await tick();
		assert.deepEqual(logs, [0, 'aborted 0', 1]);

		instance.resolve();
		await tick();

		assert.htmlEqual(target.innerHTML, `<p>one 1</p>`);
		assert.deepEqual(logs, [0, 'aborted 0', 1]);
	}
});
