export default {
	props: {
		name: 'world'
	},

	test({ assert, target }) {
		assert.equal(
			target.textContent,
			'Hello world! How are you?'
		);
	}
};
