export default {
	test({ assert, component, target, window }) {
		assert.equal(window.document.title, 'changed');
	}
};