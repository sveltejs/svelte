import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>override</button><button>increment</button><p>1</p>',
	test({ assert, target }) {
		const [override, increment] = target.querySelectorAll('button');

		flushSync(() => override.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>override</button><button>increment</button><p>1</p>'
		);

		flushSync(() => increment.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>override</button><button>increment</button><p>3</p>'
		);
	}
});
