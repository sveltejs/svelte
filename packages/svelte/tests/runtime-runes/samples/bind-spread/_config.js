import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const checkboxes = target.querySelectorAll('input');

		// input.value = '2';
		// input.dispatchEvent(new window.Event('input'));

		flushSync();

		assert.htmlEqual(target.innerHTML, `<input type="checkbox" >`.repeat(4));

		// assert.deepEqual(logs, ['b', '2', 'a', '2']);

		flushSync(() => {
			checkboxes.forEach((checkbox) => checkbox.click());
		});
		assert.deepEqual(logs, [
			'getArrayBindings',
			'getObjectBindings',
			...repeatArray(4, ['check', false])
		]);
	}
});

/** @template T */
function repeatArray(/** @type {number} */ times = 1, /** @type {T[]} */ array) {
	return /** @type {T[]} */ Array.from({ length: times }, () => array).flat();
}
