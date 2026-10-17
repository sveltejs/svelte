import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const p = /** @type {HTMLParagraphElement} */ (target.querySelector('p'));
		const [color] = target.querySelectorAll('input');

		// the browser's fallback value for an input type is not a default value
		assert.htmlEqual(p.innerHTML, '[null,null,null,"#ff0000",3]');

		color.value = '#00ff00';
		color.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync();

		assert.htmlEqual(p.innerHTML, '["#00ff00",null,null,"#ff0000",3]');
	}
});
