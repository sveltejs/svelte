import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target, window }) {
		window.temp_variable = true;

		target.innerHTML = '<custom-element></custom-element>';
		await tick();

		/** @type {ShadowRoot} */
		const shadowRoot = target.querySelector('custom-element').shadowRoot;

		assert.equal(shadowRoot.mode, 'open');
		assert.equal(shadowRoot.clonable, true);

		delete window.temp_variable;
	}
});
