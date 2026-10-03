import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>ask</button>`,

	test({ assert, target }) {
		const [ask] = target.querySelectorAll('button');

		flushSync(() => ask.click());
		assert.htmlEqual(target.innerHTML, `<button>ask</button><button>cancel</button>`);

		flushSync(() => target.querySelectorAll('button')[1].click());
		assert.htmlEqual(target.innerHTML, `<button>ask</button>`);

		flushSync(() => ask.click());
		assert.htmlEqual(target.innerHTML, `<button>ask</button><button>cancel</button>`);
	}
});
