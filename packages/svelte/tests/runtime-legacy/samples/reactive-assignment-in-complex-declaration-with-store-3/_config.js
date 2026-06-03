import { flushSync } from 'svelte';
import { test } from '../../test';
import { store } from './store.js';

export default test({
	html: '<h1>0</h1>',
	before_test() {
		store.reset();
	},
	test({ assert, target }) {
		store.set(42);
		flushSync();

		assert.htmlEqual(target.innerHTML, '<h1>42</h1>');

		assert.equal(store.numberOfTimesSubscribeCalled(), 1);
	},
	test_ssr({ assert }) {
		assert.equal(store.numberOfTimesSubscribeCalled(), 1);
		assert.equal(store.isSubscribed(), false);
	}
});
