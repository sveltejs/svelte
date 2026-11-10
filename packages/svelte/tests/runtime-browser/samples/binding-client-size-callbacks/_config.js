import { test } from '../../assert';

export default test({
	async test({ assert, component, target }) {
		const settle = () => new Promise((resolve) => setTimeout(resolve, 100));
		await settle();
		const div = /** @type {HTMLDivElement} */ (target.querySelector('div'));
		assert.equal(component.widths.length, 2);
		assert.equal(component.heights.length, 2);
		assert.equal(component.offsets.length, 2);
		const before = component.widths.length;
		div.style.width = '160px';
		div.style.height = '160px';
		await settle();
		assert.equal(component.widths.length, before + 1);
		assert.equal(component.heights.length, before + 1);
		assert.equal(component.offsets.length, before + 1);
		const width = div.clientWidth;
		div.style.scrollbarGutter = 'auto';
		await settle();
		assert.equal(div.clientWidth > width, true);
		assert.equal(component.widths.at(-1), div.clientWidth);
		assert.equal(component.widths.length, before + 2);
		assert.equal(component.heights.length, before + 1);
		assert.equal(component.offsets.length, before + 1);
		// Content-only notifications must not add unchanged size callbacks.
		div.style.padding = '20px';
		await settle();
		assert.equal(component.widths.length, before + 2);
		assert.equal(component.heights.length, before + 1);
		// Preserve the original border observer's callback even when client width is unchanged.
		div.style.boxSizing = 'content-box';
		await settle();
		const count = component.widths.length;
		const client = div.clientWidth;
		div.style.borderWidth = '5px';
		await settle();
		assert.equal(div.clientWidth, client);
		assert.equal(component.widths.length, count + 1);
		const counts = [component.widths.length, component.heights.length, component.offsets.length];
		component.visible = false;
		await settle();
		div.style.width = '200px';
		div.style.scrollbarGutter = 'stable';
		await settle();
		assert.deepEqual(
			[component.widths.length, component.heights.length, component.offsets.length],
			counts
		);
		component.visible = true;
		await settle();
		assert.equal(component.widths.length, counts[0] + 2);
		assert.equal(component.heights.length, counts[1] + 2);
		assert.equal(component.offsets.length, counts[2] + 2);
	}
});
