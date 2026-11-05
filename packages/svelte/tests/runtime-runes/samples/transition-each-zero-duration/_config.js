import { flushSync } from '../../../../src/index-client.js';
import { test } from '../../test';

export default test({
	test({ assert, raf, target }) {
		const btn = target.querySelector('button');

		// 2 has no outro to wait for, 3 does: both leave in the same update
		btn?.click();
		flushSync();
		raf.tick(100);

		assert.htmlEqual(target.innerHTML, '<button>Remove</button><p>1</p>');
	}
});
