import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	test({ assert, target }) {
		const [fork, update] = target.querySelectorAll('button');

		flushSync(() => fork.click());
		flushSync(() => update.click());

		assert.htmlEqual(target.innerHTML, '<button>fork</button> <button>update</button>');
	}
});
