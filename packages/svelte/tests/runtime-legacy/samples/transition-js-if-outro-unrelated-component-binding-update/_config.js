import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, window, raf }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click', { bubbles: true });
		button?.dispatchEvent(event);
		flushSync();
		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '');
	}
});
