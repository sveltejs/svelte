export default {
	html: '',

	test({ assert, component, target, window }) {
		component.visible = true;
		assert.equal(target.querySelector('input'), window.document.activeElement);
	}
};
