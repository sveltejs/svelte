import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, raf }) {
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		assert.htmlEqual(output.innerHTML, '1');

		flushSync(() => button.click());
		assert.htmlEqual(output.innerHTML, '2');

		// the replaced button finishes transitioning out
		raf.tick(500);
		flushSync();

		assert.equal(target.querySelectorAll('button').length, 1);
		assert.htmlEqual(output.innerHTML, '2');
	}
});
