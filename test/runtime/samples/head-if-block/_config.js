export default {
	props: {
		condition: false
	},

	test({ assert, component, window }) {
		assert.equal(window.document.title, '');

		component.condition = true;
		assert.equal(window.document.title, 'woo!!!');
	}
};
