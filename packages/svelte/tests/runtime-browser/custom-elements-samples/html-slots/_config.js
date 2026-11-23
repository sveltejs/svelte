import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');

		const div = el.shadowRoot.children[0];
		const [slot0, slot1] = div.children;

		assert.equal(slot0.localName, 'slot');
		assert.equal(slot0.assignedNodes().length, 0);
		assert.equal(slot0.innerHTML, '<p>default fallback content</p>');
		assert.equal(slot1.localName, 'slot');
		assert.equal(slot1.name, 'foo');
		assert.equal(slot1.assignedNodes().length, 0);
		assert.equal(slot1.innerHTML, '<p>foo fallback content</p>');

		const default_content = document.createElement('strong');
		default_content.textContent = 'default content';
		el.append(default_content);

		const named_content = document.createElement('strong');
		named_content.slot = 'foo';
		named_content.textContent = 'named content';
		el.append(named_content);

		assert.equal(slot0.assignedNodes().length, 1);
		assert.equal(slot0.assignedNodes()[0], default_content);
		assert.equal(slot1.assignedNodes().length, 1);
		assert.equal(slot1.assignedNodes()[0], named_content);
	}
});
