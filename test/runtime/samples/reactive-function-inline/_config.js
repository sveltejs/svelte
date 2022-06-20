export default {
	html: '<p>0</p>',

	test({ assert, component, target }) {
		component.selected = 3;
		assert.htmlEqual(target.innerHTML, '<p>3</p>');
	}
};
