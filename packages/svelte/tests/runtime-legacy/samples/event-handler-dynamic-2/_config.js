import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>toggle</button>
		<p>0</p>
		<button>handler_a</button>
		<button>handler_b</button>
	`,

	test({ assert, target, window }) {
		const [toggle, handler_a, handler_b] = target.querySelectorAll('button');
		const p = target.querySelector('p');
		ok(p);

		const event = new window.MouseEvent('click', { bubbles: true });

		handler_a.dispatchEvent(event);
		flushSync();
		assert.equal(p.innerHTML, '1');

		toggle.dispatchEvent(event);
		flushSync();

		handler_a.dispatchEvent(event);
		flushSync();
		assert.equal(p.innerHTML, '2');

		toggle.dispatchEvent(event);
		flushSync();

		handler_b.dispatchEvent(event);
		flushSync();
		assert.equal(p.innerHTML, '1');

		toggle.dispatchEvent(event);
		flushSync();

		handler_b.dispatchEvent(event);
		flushSync();

		assert.equal(p.innerHTML, '2');
	}
});
