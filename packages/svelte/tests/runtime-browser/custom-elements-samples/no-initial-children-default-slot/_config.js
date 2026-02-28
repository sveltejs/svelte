import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		// Mount the custom element with no initial children
		target.innerHTML = `<my-widget></my-widget>`;
		await tick();

		/** @type {any} */
		const ce = target.querySelector('my-widget');

		// The default slot should be created even without initial children
		assert.htmlEqual(ce.shadowRoot.innerHTML, `<slot></slot>`);

		// Now add a child dynamically
		const span = document.createElement('span');
		span.textContent = 'hello';
		ce.appendChild(span);
		await tick();

		// The slot element should still be present to render the dynamically added child
		assert.htmlEqual(ce.shadowRoot.innerHTML, `<slot></slot>`);
	}
});
