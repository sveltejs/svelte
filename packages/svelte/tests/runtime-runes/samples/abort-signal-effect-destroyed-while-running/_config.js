import { flushSync } from 'svelte';
import { test } from '../../test';

// An effect that throws when it runs again is destroyed by the error boundary while it's running.
// The signal of that run aborts, too — not only the one of the run it replaced
export default test({
	mode: ['client'],
	test({ assert, target, logs }) {
		const button = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, '<button>increment</button>');
		assert.deepEqual(logs.splice(0), ['run 0']);

		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, '<button>increment</button><p>failed</p>');
		assert.deepEqual(logs.splice(0), ['aborted 0', 'run 1', 'aborted 1']);
	}
});
