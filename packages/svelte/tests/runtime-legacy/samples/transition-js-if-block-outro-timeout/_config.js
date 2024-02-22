import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, component, target, window, raf }) {
		component.visible = true;
		const div = /** @type {HTMLDivElement} */ (target.querySelector('div'));

		component.visible = false;
		assert.equal(window.getComputedStyle(div).opacity, '1');

		raf.tick(200);
		assert.equal(window.getComputedStyle(div).opacity, '0.5');

		raf.tick(400);
		assert.equal(window.getComputedStyle(div).opacity, '0');

		raf.tick(600);
		assert.equal(target.querySelector('div'), undefined);
		flushSync();
		assert.equal(component.div, undefined);
	}
});
