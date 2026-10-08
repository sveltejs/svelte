import { test } from '../../assert';

export default test({
	async test({ assert, component, target }) {
		const div = /** @type {HTMLDivElement} */ (target.querySelector('div'));
		const settle = () => new Promise((resolve) => setTimeout(resolve, 100));
		await settle();
		assert.equal(component.clientWidth, div.clientWidth);
		assert.equal(component.clientHeight, div.clientHeight);
		const width = div.clientWidth;
		const height = div.clientHeight;
		div.style.scrollbarGutter = 'auto';
		await settle();
		assert.equal(div.clientWidth > width, true);
		assert.equal(component.clientWidth, div.clientWidth);
		div.style.scrollbarGutter = 'stable';
		await settle();
		assert.equal(component.clientWidth, width);
		assert.equal(component.clientHeight, height);
		div.style.padding = '20px';
		await settle();
		assert.equal(component.clientWidth, div.clientWidth);
		assert.equal(component.clientHeight, div.clientHeight);
		assert.equal(component.offsetWidth, div.offsetWidth);
		assert.equal(component.offsetHeight, div.offsetHeight);
	}
});
