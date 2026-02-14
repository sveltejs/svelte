import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		// Mount custom element without any children
		target.innerHTML = `<custom-element></custom-element>`;
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const slot = el.shadowRoot.querySelector('slot');

		// The default slot element should be created even without initial children
		assert.ok(slot, 'default slot element should exist');

		// Dynamically add a child element
		const span = document.createElement('span');
		span.textContent = 'dynamic child';
		el.appendChild(span);

		// The dynamically added child should be slotted
		assert.equal(slot.assignedNodes().length, 1);
		assert.equal(slot.assignedNodes()[0], span);
	}
});
