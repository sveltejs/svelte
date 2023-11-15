import { ok, test } from '../../test';

export default test({
	html: `
		<button>toggle</button>
		<p>0</p>
		<button>handler_a</button>
		<button>handler_b</button>
	`,

	async test({ assert, target, window }) {
		const [toggle, handler_a, handler_b] = target.querySelectorAll('button');
		const p = target.querySelector('p');
		ok(p);

		const event = new window.MouseEvent('click', { bubbles: true });

		await handler_a.dispatchEvent(event);
		assert.equal(p.innerHTML, '1');

		await toggle.dispatchEvent(event);

		await handler_a.dispatchEvent(event);
		assert.equal(p.innerHTML, '2');

		await toggle.dispatchEvent(event);

		await handler_b.dispatchEvent(event);
		assert.equal(p.innerHTML, '1');

		await toggle.dispatchEvent(event);

		await handler_b.dispatchEvent(event);
		assert.equal(p.innerHTML, '2');
	}
});
