import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>Disable</button>
		<button slot="footer">Button</button>
		<button slot="footer">Button</button>
	`,
	test({ assert, target, window }) {
		const [btn, btn1, btn2] = target.querySelectorAll('button');

		btn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.equal(btn1.disabled, true);
		assert.equal(btn2.disabled, true);
	}
});
