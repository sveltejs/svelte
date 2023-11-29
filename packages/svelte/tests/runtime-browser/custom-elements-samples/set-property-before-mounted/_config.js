import { test } from '../../assert';

const tick = () => Promise.resolve();

export default test({
	async test({ assert, target, componentCtor }) {
		target.innerHTML = '<custom-element red white></custom-element>';
		const ce = target.querySelector('custom-element');
		ce.prop = 1;
		customElements.define('custom-element', componentCtor.element);
		await tick();
		await tick();

		const ce_root = target.querySelector('custom-element').shadowRoot;
		const p = ce_root.querySelector('p');

		assert.equal(p.textContent, '1');

		ce.prop = 2;
		await tick();
		await tick();

		assert.equal(p.textContent, '2');
	}
});
