import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		let [btn1, btn2] = target.querySelectorAll('button');

		btn1?.click();
		flushSync();

		btn2?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `<button>change</button><button>change</button>\nfalse`);
	}
});
