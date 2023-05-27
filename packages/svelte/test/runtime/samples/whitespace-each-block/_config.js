export default {
	get props() {
		return { characters: ['a', 'b', 'c'] };
	},

	test({ assert, target }) {
		assert.equal(target.textContent, 'a b c ');
	}
};
