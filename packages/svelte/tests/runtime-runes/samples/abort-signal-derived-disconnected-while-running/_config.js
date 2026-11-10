import { flushSync } from 'svelte';
import { test } from '../../test';

// A derived that throws when it runs again makes the error boundary destroy the effect that reads it, while
// the derived is running. Nothing reads the derived anymore, so its signals abort — including that of the run
// in progress, not only the one of the run it replaced
export default test({
	mode: ['client'],
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>0</p>');
		assert.deepEqual(logs.splice(0), ['run 0']);

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>failed</p>');
		assert.deepEqual(logs.splice(0), ['aborted 0', 'run 1', 'aborted 1']);
	}
});
