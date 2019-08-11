export default {
	props: {
		condition: false
	},

	test({ assert, component, target, window }) {
		assert.equal(window.document.title, '');

		component.condition = true;
		assert.equal(window.document.title, 'woo!!!');
	}
};
