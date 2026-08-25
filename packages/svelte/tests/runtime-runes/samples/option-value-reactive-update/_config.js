import { flushSync } from 'svelte';
import { test } from '../../test';

// the `__value` guard caches the evaluated value, and the assignment inside it reads that
// cache back rather than re-evaluating the expression. Check the DOM still tracks updates
// for plain reads, memoized calls, and `undefined`.
export default test({
	mode: ['client'],

	test({ assert, target }) {
		const [select, select_1, select_2] = target.querySelectorAll('select');
		const [update, select_a] = target.querySelectorAll('button');

		const values = (/** @type {HTMLSelectElement} */ node) =>
			[...node.options].map((option) => [option.value, /** @type {any} */ (option).__value]);

		assert.deepEqual(values(select), [
			['a', 'a'],
			['b', 'b']
		]);

		assert.deepEqual(values(select_1), [
			['aa', 'aa'],
			['bb', 'bb']
		]);

		assert.deepEqual(values(select_2), [
			['', undefined],
			['', undefined]
		]);

		assert.equal(select.value, 'b');

		flushSync(() => select_a.click());
		assert.equal(select.value, 'a');

		flushSync(() => update.click());

		assert.deepEqual(values(select), [
			['c', 'c'],
			['d', 'd']
		]);

		assert.deepEqual(values(select_1), [
			['cc', 'cc'],
			['dd', 'dd']
		]);
	}
});
