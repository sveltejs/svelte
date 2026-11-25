import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target }) {
		const [written, local, snapshot] = target.querySelectorAll('output');
		const [button] = target.querySelectorAll('button');

		// every write to outside state was refused...
		assert.htmlEqual(written.innerHTML, '');

		// ...but writes to state created inside the derived were not
		assert.htmlEqual(local.innerHTML, '1 1 5 https://a.com/b?c=d 2 2');

		// and the refused writes left the underlying data untouched
		flushSync(() => button.click());
		assert.htmlEqual(snapshot.innerHTML, 'unchanged');
	}
});
