export default {
	props: {
		characters: ['a', 'b', 'c']
	},

	test({ assert, target }) {
		assert.equal(
			target.textContent,
			'a b c '
		);
	}
};
