import { test } from '../../test';

export default test({
	mode: ['client', 'server'],
	html: `<my-custom-element>Default <span slot="slot">Slotted</span></my-custom-element>`,
	test({ target, assert }) {
		const shadowRoot = /** @type {ShadowRoot} */ (
			target.querySelector('my-custom-element')?.shadowRoot
		);
		const [defaultSlot, namedSlot] = shadowRoot.querySelectorAll('slot');
		const assignedDefaultNodes = defaultSlot.assignedNodes();
		const assignedNamedNodes = namedSlot.assignedNodes();

		assert.equal(assignedDefaultNodes.length, 1);
		assert.equal(assignedNamedNodes.length, 1);
		assert.htmlEqual(assignedDefaultNodes[0].textContent || '', `Default`);
		assert.htmlEqual(
			/** @type {HTMLElement} */ (assignedNamedNodes[0]).outerHTML,
			`<span slot="slot">Slotted</span>`
		);
	}
});
