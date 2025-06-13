import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');
		const [div] = target.querySelectorAll('div');

		flushSync(() => btn1?.click());
		assert.htmlEqual(div.innerHTML, '123 123');
		assert.equal(div.inert, true);

		flushSync(() => btn2?.click());
		assert.htmlEqual(div.innerHTML, '');
		assert.deepEqual(logs, ['123']);
	}
});
