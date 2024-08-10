import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element></custom-element>';
		/** @type {any} */
		const el = target.querySelector('custom-element');

		/** @type {string[]} */
		const events = [];
		const handle_evt = (e) => events.push(e.type, e.detail);
		el.addEventListener('greeting', handle_evt);

		await tick();

		el.shadowRoot.querySelectorAll('button')[0].click();
		el.shadowRoot.querySelectorAll('button')[1].click();
		assert.deepEqual(events, ['greeting', 'hello', 'greeting', 'welcome']);

		el.removeEventListener('greeting', handle_evt);
		el.shadowRoot.querySelectorAll('button')[0].click();
		el.shadowRoot.querySelectorAll('button')[1].click();
		assert.deepEqual(events, ['greeting', 'hello', 'greeting', 'welcome']);
	}
});
