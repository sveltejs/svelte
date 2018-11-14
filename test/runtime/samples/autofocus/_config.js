export default {
	html: '',

	test ( assert, component, target, window ) {
		component.visible = true;
		assert.equal( component.refs.input, window.document.activeElement );
	}
};
