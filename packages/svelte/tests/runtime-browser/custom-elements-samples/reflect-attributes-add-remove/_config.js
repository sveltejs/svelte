import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		const element = document.createElement('custom-element');
		target.appendChild(element);
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		el.shadowRoot.querySelector('button').click();
		await tick();

		assert.equal(el.getAttribute('aria-expanded'), '');
		el.shadowRoot.querySelector('button').click();
		await tick();

		assert.equal(el.getAttribute('aria-expanded'), null);
	}
});
