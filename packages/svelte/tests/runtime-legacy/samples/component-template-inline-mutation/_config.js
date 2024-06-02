import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const btns = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		btns[0].dispatchEvent(event);
		btns[0].dispatchEvent(event);
		btns[1].dispatchEvent(event);
		btns[1].dispatchEvent(event);
		btns[1].dispatchEvent(event);
		flushSync();

		assert.equal(btns[1].innerHTML, '3');
	}
});
