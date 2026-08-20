import { test } from '../../assert';

export default test({
	async test({ assert, target, window }) {
		const input = /** @type {HTMLInputElement} */ (target.querySelector('input'));
		const thead = /** @type {HTMLTableSectionElement} */ (target.querySelector('thead'));
		const wait = () =>
			new Promise((resolve) => {
				window.requestAnimationFrame(() => window.requestAnimationFrame(resolve));
			});

		assert.equal(thead.getBoundingClientRect().height > 0, true);
		input.click();
		await wait();
		input.click();
		await wait();
		assert.equal(thead.getBoundingClientRect().height > 0, true);
	}
});
