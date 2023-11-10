import { test } from '../../test';

export default test({
	get props() {
		return { characters: ['a', 'b', 'c'] };
	},

	test({ assert, target }) {
		assert.equal(target.textContent, 'abc');
	}
});
