import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const checkboxes = target.querySelectorAll('input');

		flushSync();

		assert.htmlEqual(target.innerHTML, `<input type="checkbox" >`.repeat(checkboxes.length));

		flushSync(() => {
			checkboxes.forEach((checkbox) => checkbox.click());
		});
		assert.deepEqual(logs, [
			'getArrayBindings',
			'getObjectBindings',
			...repeatArray(checkboxes.length, ['check', false])
		]);
	}
});

/** @template T */
function repeatArray(/** @type {number} */ times, /** @type {T[]} */ array) {
	return /** @type {T[]} */ Array.from({ length: times }, () => array).flat();
}
