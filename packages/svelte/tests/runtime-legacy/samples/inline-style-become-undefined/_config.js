import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, window }) {
		const div = target.querySelector('div');
		ok(div);
		const click = new window.MouseEvent('click', { bubbles: true });

		assert.htmlEqual(target.innerHTML, '<div style="background: red;"></div>');
		div.dispatchEvent(click);
		flushSync();
		assert.htmlEqual(target.innerHTML, '<div style=""></div>');
	}
});
