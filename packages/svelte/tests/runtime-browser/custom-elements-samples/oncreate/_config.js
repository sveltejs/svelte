import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<my-app prop/>';
		await tick();
		await tick();
		await tick();

		/** @type {any} */
		const el = target.querySelector('my-app');

		assert.ok(el.wasCreated);
		assert.ok(el.propsInitialized);
	}
});
