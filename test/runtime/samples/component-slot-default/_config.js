export default {
	html: '<p><slot>Hello</slot></p>',

	test(assert, component) {
		assert.htmlEqual(component.refs.nested.slots.default.innerHTML, 'Hello');
	}
};
