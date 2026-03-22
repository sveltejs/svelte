import { flushSync } from 'svelte';
import { test } from '../../test';

// While we don't officially document it, `untrack` also allows to opt out of the "unsafe mutation" validation, which is what we test here
export default test({
	html: '<button>0 0 0</button>',
	test({ assert, target }) {
		const button = target.querySelector('button');

		flushSync(() => button?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1 1 2</button>
			`
		);
	}
});
