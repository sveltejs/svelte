import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element name="foo"></custom-element>';
		await tick();
		await tick();
		/** @type {any} */
		const el = target.querySelector('custom-element');
		const events = el.events; // need to get the array reference, else it's gone when destroyed
		assert.deepEqual(events, ['foo']);

		el.name = 'bar';
		await tick();
		await tick();
		assert.deepEqual(events, ['foo', 'bar']);

		target.innerHTML = '';
		await tick();
		assert.deepEqual(events, ['foo', 'bar', 'destroy']);
	}
});
