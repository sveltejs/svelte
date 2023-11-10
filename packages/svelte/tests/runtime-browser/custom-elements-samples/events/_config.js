import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		/** @type {any} */
		const el = target.querySelector('custom-element');

		/** @type {string[]} */
		const events = [];
		const custom_before = () => {
			events.push('before');
		};
		const click_before = () => {
			events.push('click_before');
		};
		el.addEventListener('custom', custom_before);
		el.addEventListener('click', click_before);

		await tick();

		el.addEventListener('custom', (e) => {
			events.push(e.detail);
		});
		el.addEventListener('click', () => {
			events.push('click');
		});

		el.shadowRoot.querySelector('button').click();
		assert.deepEqual(events, ['before', 'foo', 'click_before', 'click']);

		el.removeEventListener('custom', custom_before);
		el.removeEventListener('click', click_before);
		el.shadowRoot.querySelector('button').click();
		assert.deepEqual(events, ['before', 'foo', 'click_before', 'click', 'foo', 'click']);
	}
});
