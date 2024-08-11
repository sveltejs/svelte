import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true,
		hmr: true
	},

	async test({ assert, target, raf }) {
		const [b1] = target.querySelectorAll('button');

		b1.click();

		flushSync();

		b1.click();

		flushSync();

		raf.tick(0);

		raf.tick(250);
		const div = /** @type {HTMLDivElement} */ (target.querySelector('.red'));
		assert.equal(div.style.opacity, '0.5');
	}
});
