import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element name="world"><span>slotted</span></custom-element>';
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('custom-element');
		const h1 = el.querySelector('h1');

		assert.equal(el.name, 'world');
		assert.equal(el.shadowRoot, null);
		assert.equal(h1.innerHTML, 'Hello world!');
		assert.equal(getComputedStyle(h1).color, 'rgb(255, 0, 0)');
		assert.equal(el.querySelector('slot').innerHTML, '');
	}
});
