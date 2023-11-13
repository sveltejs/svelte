import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<my-app/>';
		await tick();
		await tick();
		/** @type {any} */
		const el = target.querySelector('my-app');
		target.removeChild(el);

		await tick();

		assert.ok(target.dataset.onMountDestroyed);
		assert.ok(target.dataset.destroyed);
	}
});
