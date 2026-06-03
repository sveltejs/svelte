import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();

		/** @type {ShadowRoot} */
		const shadowRoot = target.querySelector('custom-element').shadowRoot;

		assert.equal(shadowRoot.mode, 'open');
		assert.equal(shadowRoot.clonable, true);
		assert.equal(shadowRoot.delegatesFocus, true);
		assert.equal(shadowRoot.serializable, true);
		assert.equal(shadowRoot.slotAssignment, 'manual');
	}
});
