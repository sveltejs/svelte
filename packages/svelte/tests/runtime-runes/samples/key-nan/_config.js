import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>update</button><p>it rendered</p>',

	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['rendering']);

		const btn = target.querySelector('button');
		flushSync(() => btn?.click());

		// should not re-render
		assert.deepEqual(logs, ['rendering']);
		assert.htmlEqual(target.innerHTML, '<button>update</button><p>it rendered</p>');
	}
});
