import { test, ok } from '../../test';
import { flushSync } from 'svelte';

export default test({
	mode: ['client'],

	async test({ assert, target }) {
		/**
		 * @type {HTMLInputElement | null}
		 */
		const input = target.querySelector('input[type=text]');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const setString = target.querySelector('#setString');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const setNull = target.querySelector('#setNull');
		/**
		 * @type {HTMLButtonElement | null}
		 */
		const setUndefined = target.querySelector('#setUndefined');

		ok(input);
		ok(setString);
		ok(setNull);
		ok(setUndefined);

		// value should always be blank string when value attribute is set to null or undefined

		assert.equal(input.value, '');
		setString.click();
		flushSync();
		assert.equal(input.value, 'foo');

		setNull.click();
		flushSync();
		assert.equal(input.value, '');

		setString.click();
		flushSync();
		assert.equal(input.value, 'foo');

		setUndefined.click();
		flushSync();
		assert.equal(input.value, '');
	}
});
