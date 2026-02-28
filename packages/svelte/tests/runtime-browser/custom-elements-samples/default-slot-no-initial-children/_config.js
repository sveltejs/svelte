import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		// --- Test 1: Empty element, dynamically add a child ---
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

		// --- Test 2: Multiple dynamic additions ---
		const span2 = document.createElement('span');
		span2.textContent = 'second child';
		el.appendChild(span2);

		assert.equal(slot.assignedNodes().length, 2, 'slot should have two assigned nodes');
		assert.equal(slot.assignedNodes()[0], span);
		assert.equal(slot.assignedNodes()[1], span2);

		// --- Test 3: Regression test - element with initial children still works ---
		target.innerHTML = `<custom-element><span>initial child</span></custom-element>`;
		await tick();
		await tick();

		/** @type {any} */
		const el2 = target.querySelector('custom-element');
		const slot2 = el2.shadowRoot.querySelector('slot');

		assert.ok(slot2, 'default slot should exist with initial children');
		assert.equal(slot2.assignedNodes().length, 1, 'initial child should be slotted');
		assert.equal(
			slot2.assignedNodes()[0].textContent,
			'initial child',
			'initial child content should match'
		);

		// Adding another child dynamically to an element that had initial children
		const span3 = document.createElement('span');
		span3.textContent = 'added later';
		el2.appendChild(span3);

		assert.equal(
			slot2.assignedNodes().length,
			2,
			'dynamically added child should also be slotted alongside initial child'
		);
	}
});
