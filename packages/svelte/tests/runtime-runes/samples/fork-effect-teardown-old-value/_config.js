import { tick } from 'svelte';
import { test } from '../../test';

// A teardown caused by committing a fork sees the values from before the fork's writes
export default test({
	skip_no_async: true,
	async test({ assert, target, logs }) {
		const [fork, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();
		assert.deepEqual(logs, ['effect: 0']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>fork</button><button>commit</button><p>1</p>');
		assert.deepEqual(logs, ['effect: 0', 'teardown: 0', 'effect: 1']);
	}
});
