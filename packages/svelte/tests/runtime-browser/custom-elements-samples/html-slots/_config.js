import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = `
		<custom-element>
			<strong>slotted</strong>
		</custom-element>`;
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');

		const div = el.shadowRoot.children[0];
		const [slot0, slot1] = div.children;

		assert.equal(slot0.assignedNodes()[1], target.querySelector('strong'));
		assert.equal(slot1.innerHTML, 'foo fallback content');
	}
});
