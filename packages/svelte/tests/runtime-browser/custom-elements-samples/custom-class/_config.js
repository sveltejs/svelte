import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		/** @type {any} */
		const element = document.createElement('custom-element');
		element.updateFoo('42');
		target.appendChild(element);
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const p = el.shadowRoot.querySelector('p');
		assert.equal(p.textContent, '42');
	}
});
