import { test } from '../../test';
import { counts, reset } from './store.js';

// A blocked store subscription is created after the synchronous part of the
// render has finished, so the teardown must wait for the async work.
export default test({
	mode: ['async-server'],

	before_test() {
		reset();
	},

	ssrHtml: '<p>hello</p>',

	test_ssr({ assert }) {
		assert.deepEqual(counts, { subscribes: 1, unsubscribes: 1 });
	}
});
