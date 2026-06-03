import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();

		const el = target.querySelector('custom-element');

		assert.equal(el.shadowRoot, null);
	}
});
