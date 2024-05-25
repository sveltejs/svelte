import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		await tick();
		/** @type {HTMLElement} */
		const el = target.querySelector('.test');
		el.addEventListener('animationend', async () => {
			await tick();
			assert.exists(document.querySelector('.result'));
		});
	}
});
