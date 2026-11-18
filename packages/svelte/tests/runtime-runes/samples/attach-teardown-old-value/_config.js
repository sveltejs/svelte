import { flushSync } from 'svelte';
import { test } from '../../test';

// The teardown is caused by `object` becoming `null`, so it sees the object from before
export default test({
	html: '<button>clear</button><div></div>',

	test({ assert, target, logs }) {
		flushSync(() => target.querySelector('button')?.click());

		assert.htmlEqual(target.innerHTML, '<button>clear</button>');
		assert.deepEqual(logs, ['detach: 1']);
	}
});
