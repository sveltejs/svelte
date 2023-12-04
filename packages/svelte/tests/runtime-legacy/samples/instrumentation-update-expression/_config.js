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
	async test({ assert, target, window }) {
		const [foo, bar] = target.querySelectorAll('p');
		const [button1, button2, button3, button4] = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await button1.dispatchEvent(event);
		assert.equal(foo.innerHTML, '1');
		assert.equal(bar.innerHTML, '0');

		await button2.dispatchEvent(event);
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '0');

		await button3.dispatchEvent(event);
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '1');

		await button4.dispatchEvent(event);
		assert.equal(foo.innerHTML, '2');
		assert.equal(bar.innerHTML, '2');
	}
});
