import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, component }) {
		const { foo, p } = component;

		/** @type {string[]} */
		const values = [];

		Object.defineProperty(p.childNodes[0], 'nodeValue', {
			set(value) {
				values.push('' + value);
			}
		});

		foo.double();
		flushSync();

		assert.deepEqual(values, ['6']);
	}
});
