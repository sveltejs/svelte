import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,

	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [fork, commit] = target.querySelectorAll('button');

		// the branch is created in the fork's view, but `$inspect` observes the real world
		flushSync(() => fork.click());
		assert.deepEqual(logs, ['init: 0']);

		commit.click();
		await tick();
		assert.htmlEqual(target.innerHTML, '<button>fork</button><button>commit</button><p>1</p>');
		assert.deepEqual(logs, ['init: 0', 'update: 1']);
	}
});
