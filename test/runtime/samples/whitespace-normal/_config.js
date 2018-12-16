export default {
	props: {
		name: 'world'
	},

	test({ assert, component, target }) {
		assert.equal(
			target.textContent,
			`Hello world! How are you?`
		);
	}
};