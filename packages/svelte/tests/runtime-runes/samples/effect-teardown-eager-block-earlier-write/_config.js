import { flushSync } from 'svelte';
import { test } from '../../test';

// Like `effect-teardown-eager-block-old-value`, but another effect writes state before the one
// that deselects the branch. Its write applies in the teardown's view, but that mustn't
// revert `count`, whose batch has committed by the time the branch is detached
export default test({
	html: '<button>increment</button><p>child</p>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs, ['setup', 'teardown: count=1 show=true']);
	}
});
