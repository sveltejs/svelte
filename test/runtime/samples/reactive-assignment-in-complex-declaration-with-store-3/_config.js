import { store } from './store.js';

export default {
	html: '<h1>0</h1>',
	before_test() {
		store.reset();
	},
	async test({ assert, target }) {
		store.set(42);

		await Promise.resolve();

		assert.htmlEqual(target.innerHTML, '<h1>42</h1>');

		assert.equal(store.numberOfTimesSubscribeCalled(), 1);
	},
	test_ssr({ assert }) {
		assert.equal(store.numberOfTimesSubscribeCalled(), 1);
	}
};
