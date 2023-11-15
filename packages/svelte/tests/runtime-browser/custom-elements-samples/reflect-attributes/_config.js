import { test } from '../../assert';
const tick = () => Promise.resolve();

export default test({
	async test({ assert, target }) {
		target.innerHTML = '<custom-element red white></custom-element>';
		await tick();
		await tick();
		await tick();
		const ce_root = /** @type {any} */ (target.querySelector('custom-element')).shadowRoot;
		const div = ce_root.querySelector('div');
		const p = ce_root.querySelector('p');
		const button = ce_root.querySelector('button');

		assert.equal(getComputedStyle(div).color, 'rgb(255, 0, 0)');
		assert.equal(getComputedStyle(p).color, 'rgb(255, 255, 255)');

		const inner_root = ce_root.querySelector('my-widget').shadowRoot;
		const inner_div = inner_root.querySelector('div');
		const inner_p = inner_root.querySelector('p');

		assert.equal(getComputedStyle(inner_div).color, 'rgb(255, 0, 0)');
		assert.equal(getComputedStyle(inner_p).color, 'rgb(255, 255, 255)');

		button.click();
		await tick();
		await tick();

		assert.equal(getComputedStyle(div).color, 'rgb(0, 0, 0)');
		assert.equal(getComputedStyle(inner_div).color, 'rgb(0, 0, 0)');
	}
});
