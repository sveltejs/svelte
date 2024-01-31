import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		/** @type {HTMLButtonElement | null} */
		const increment = target.querySelector('#increment');
		/** @type {HTMLButtonElement | null} */
		const change_ref = target.querySelector('#change-ref');
		/** @type {HTMLParagraphElement | null} */
		const count = target.querySelector('#count');
		/** @type {HTMLParagraphElement | null} */
		const fallback_count = target.querySelector('#fallback-count');

		assert.htmlEqual(count?.innerHTML ?? '', 'Count: 0');
		assert.htmlEqual(fallback_count?.innerHTML ?? '', 'Fallback count: 0');

		await increment?.click();
		assert.htmlEqual(count?.innerHTML ?? '', 'Count: 1');
		assert.htmlEqual(fallback_count?.innerHTML ?? '', 'Fallback count: 0');

		await change_ref?.click();
		await increment?.click();
		assert.htmlEqual(count?.innerHTML ?? '', 'Count: 1');
		assert.htmlEqual(fallback_count?.innerHTML ?? '', 'Fallback count: 1');

		await change_ref?.click();
		await increment?.click();
		assert.htmlEqual(count?.innerHTML ?? '', 'Count: 2');
		assert.htmlEqual(fallback_count?.innerHTML ?? '', 'Fallback count: 1');
	}
});
