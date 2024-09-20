import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element><span></span></custom-element>';

		const custom_element = target.querySelector('custom-element');

		const logs = [];
		custom_element.callback = () => {
			logs.push('called');
		};

		await tick();
		/** @type {any} */
		const span = target.querySelector('span');
		span.click();
		assert.deepEqual(logs, ['called']);
	}
});
