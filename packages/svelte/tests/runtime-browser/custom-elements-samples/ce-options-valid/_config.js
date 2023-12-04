import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element name="world"></custom-element>';
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const h1 = el.shadowRoot.querySelector('h1');

		assert.equal(h1.textContent, 'Hello world!');
	}
});
