import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		/** @type {any} */
		const el = target.querySelector('custom-element');

		/** @type {string} */
		let html = '';
		const handle_evt = (e) => (html = e.detail);
		el.addEventListener('html', handle_evt);

		await tick();
		await tick();
		await tick();

		assert.ok(html.includes('<style'));
	}
});
