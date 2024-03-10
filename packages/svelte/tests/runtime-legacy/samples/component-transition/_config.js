import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const button = /** @type {HTMLButtonElement} */ (target.querySelector('#button'));
		const container = target.querySelector('#container');
		ok(button);
		ok(container);

		// Multiple click on button
		button.click();
		button.click();
		button.click();
		button.click();
		button.click();
		button.click();
		button.click();

		raf.tick(0);
		assert.equal(container.children.length, 1);

		flushSync();

		raf.tick(501);
		assert.equal(container.children.length, 0);
	}
});
