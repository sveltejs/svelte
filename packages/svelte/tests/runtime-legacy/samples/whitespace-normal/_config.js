import { test } from '../../test';

export default test({
	get props() {
		return { name: 'world' };
	},

	test({ assert, target }) {
		assert.equal(target.textContent, 'Hello world! How are you?');
	}
});
