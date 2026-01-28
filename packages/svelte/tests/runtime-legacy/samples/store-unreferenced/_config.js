import { flushSync } from 'svelte';
import { test } from '../../test';
import { count } from './store.js';

export default test({
	html: '<p>count: 0</p>',

	before_test() {
		count.set(0);
	},

	test({ assert, component, target }) {
		component.increment();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<p>count: 1</p>');
	}
});
