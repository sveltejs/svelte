import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<p>0</p>
		<button>foo++</button>
		<button>++foo</button>
		<p>0</p>
		<button>bar.bar++</button>
		<button>++bar.bar</button>
	`,
	test({ assert, target, window }) {
		const [foo, bar] = target.querySelectorAll('p');
		const [button1, button2, button3, button4] = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		button1.dispatchEvent(event);
		flushSync();
		assert.equal(foo.innerHTML, '1');
		assert.equal(bar.innerHTML, '0');

		button2.dispatchEvent(event);
		flushSync();
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '0');

		button3.dispatchEvent(event);
		flushSync();
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '1');

		button4.dispatchEvent(event);
		flushSync();
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '2');
	}
});
