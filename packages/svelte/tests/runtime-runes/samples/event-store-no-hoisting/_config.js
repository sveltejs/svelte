import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [b1, b2] = target.querySelectorAll('button');

		b1.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'<button>set new store</button><button>incr</button><pre>0</pre>'
		);

		b2.click();
		b2.click();
		b2.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			'<button>set new store</button><button>incr</button><pre>3</pre>'
		);
	}
});
