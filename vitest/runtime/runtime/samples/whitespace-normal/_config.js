export default {
	props: {
		name: 'world'
	},

	test({ assert, target }) {
		assert.fail("fuck you");
		assert.equal(target.textContent, 'Hello world! How are you?');
	}
};
