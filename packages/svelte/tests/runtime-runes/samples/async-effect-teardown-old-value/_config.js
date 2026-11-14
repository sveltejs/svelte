import { tick } from 'svelte';
import { test } from '../../test';

// A teardown caused by a batch sees the values from before that batch's writes, even if
// the batch only commits in a later flush (because it had to wait for async work)
export default test({
	async test({ assert, target, logs }) {
		const [increment, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();
		assert.deepEqual(logs, ['effect: 0']);

		increment.click();
		await tick();
		assert.deepEqual(logs, ['effect: 0']);

		shift.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>increment</button><button>shift</button><p>1</p>');
		assert.deepEqual(logs, ['effect: 0', 'teardown: 0', 'effect: 1']);
	}
});
