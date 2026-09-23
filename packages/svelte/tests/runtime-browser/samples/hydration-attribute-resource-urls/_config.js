import { flushSync, hydrate, unmount } from 'svelte';
import { assert_ok, test } from '../../assert';

/** @type {string} */
let html;

export default test({
	mode: ['hydrate'],

	before_test() {
		const main = document.querySelector('main');
		assert_ok(main);
		html = main.innerHTML;
	},

	async test({ assert, componentCtor }) {
		// the page is `about:blank`, so `1` and `true` can't be resolved and each image fails to load
		const container = document.createElement('div');
		container.innerHTML = html;

		const images = [...container.querySelectorAll('image')];
		const errors = images.map(() => 0);
		images.forEach((image, i) => image.addEventListener('error', () => errors[i]++));

		document.body.append(container);

		// wait until every image reported its initial error, before hydrating
		const start = performance.now();
		while (errors.some((count) => count === 0) && performance.now() - start < 2000) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		assert.deepEqual(errors, [1, 1, 1, 1, 1, 1]);

		const app = hydrate(componentCtor, { target: container, recover: false });
		flushSync();
		await new Promise((resolve) => setTimeout(resolve, 100));

		// writing an image's `href` or `xlink:href` resolves it again, even with the value it has, so
		// hydration still writes it and every image reports another error
		assert.deepEqual(errors, [2, 2, 2, 2, 2, 2]);

		const hydrated = [...container.querySelectorAll('image')];
		assert.equal(hydrated.length, images.length);
		hydrated.forEach((image, i) => assert.equal(image, images[i]));

		unmount(app);
		container.remove();
	}
});
