import { flushSync } from 'svelte';
import { test } from '../../test';

// This test is slightly inaccurate, because blurring elements (or focusing the `<body>` directly)
// doesn't trigger the relevant `focusin` event in JSDOM.
export default test({
	test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		flushSync(() => btn1.focus());
		assert.deepEqual(logs, ['...', 'BODY', 'one']);

		flushSync(() => btn2.focus());
		assert.deepEqual(logs, ['...', 'BODY', 'one', 'two']);
	}
});
