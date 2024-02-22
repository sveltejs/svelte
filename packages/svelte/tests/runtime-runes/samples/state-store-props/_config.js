import { flushSync } from '../../../../src/main/main-client';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		flushSync(() => {
			btn?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`<pre>{\n"data": { "tags": { "first": 1, "second": 2, "third": 3 } } }</pre><button>add</button>`
		);
	}
});
