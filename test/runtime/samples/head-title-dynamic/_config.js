export default {
	props: {
		adjective: 'custom'
	},

	test({ assert, component, target, window }) {
		assert.equal(window.document.title, 'a custom title');

		component.adjective = 'different';
		assert.equal(window.document.title, 'a different title');
	}
};