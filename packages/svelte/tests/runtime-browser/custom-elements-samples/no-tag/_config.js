import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	warnings: [],
	async test({ assert, target, componentCtor }) {
		customElements.define('no-tag', componentCtor.element);
		target.innerHTML = '<no-tag name="world"></no-tag>';
		await tick();

		/** @type {any} */
		const el = target.querySelector('no-tag');
		const h1 = el.shadowRoot.querySelector('h1');

		assert.equal(h1.textContent, 'Hello world!');
	}
});
