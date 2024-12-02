import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<my-app/>';
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('my-app');
		const button = el.shadowRoot.querySelector('button');
		const p = el.shadowRoot.querySelector('my-tracking').shadowRoot.querySelector('p');

		assert.equal(button.innerHTML, '0');
		assert.equal(p.innerHTML, 'false');

		button.click();
		await tick();

		assert.equal(button.innerHTML, '1');
		assert.equal(p.innerHTML, 'false');
	}
});
