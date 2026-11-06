import { tick } from 'svelte';
import { test } from '../../test';

// The effect is created after the fork wrote `x`, but doesn't see the write (which is only part of the
// fork's view of the world). So when committing the fork destroys it, its teardown sees the old value —
// even though the effect never read `x`, and the write keeps the (earlier) version it had in the fork
export default test({
	skip_no_async: true,

	async test({ assert, target, logs }) {
		const [fork, show, commit] = target.querySelectorAll('button');

		fork.click();
		await tick();

		show.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>fork</button><button>show</button><button>commit</button><p>child</p>'
		);
		assert.deepEqual(logs, ['effect']);

		commit.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>fork</button><button>show</button><button>commit</button>'
		);
		assert.deepEqual(logs, ['effect', 'teardown: x=0']);
	}
});
