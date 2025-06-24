import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	expect_hydration_error: true,
	test(assert, target, snapshot, component, window) {
		assert.equal(window.document.querySelectorAll('meta').length, 5);

		const [button] = target.getElementsByTagName('button');
		button.click();
		flushSync();

		/** @type {NodeList} */
		const metas = window.document.querySelectorAll('meta[name=count]');
		assert.equal(metas.length, 4);
		metas.forEach((meta) => assert.equal(/** @type {HTMLMetaElement} */ (meta).content, '2'));
	}
});
