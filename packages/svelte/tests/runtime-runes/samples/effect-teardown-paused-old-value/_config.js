import { flushSync } from 'svelte';
import { test } from '../../test';

// The effect is paused while the branch transitions out, so it doesn't re-run when `count` changes. Its
// teardown should see the value it saw when it last ran, but that is lost once the batch that wrote `count`
// commits, so it sees the new one. TODO keep the old values of paused effects
export default test({
	skip: true,

	test({ assert, raf, target, logs }) {
		const [hide, increment] = target.querySelectorAll('button');

		flushSync(() => hide.click());
		raf.tick(50);

		flushSync(() => increment.click());
		raf.tick(150);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>hide</button><button>increment</button>');
		assert.deepEqual(logs, ['effect: 0', 'teardown: 0']);
	}
});
