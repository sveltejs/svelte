import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	skip: true, // TODO: needs inline CSS, decide how to add
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		await tick();
		/** @type {any} */
		const ce = target.querySelector('custom-element');
		const icon = ce.shadowRoot.querySelector('.icon');
		const before = getComputedStyle(icon, '::before');

		assert.equal(before.content, JSON.stringify(String.fromCharCode(0xff)));
	}
});
