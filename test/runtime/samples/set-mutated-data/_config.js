const props = { foo: 0 };

export default {
	props,

	html: '0',

	test(assert, component, target) {
		props.foo = 42;
		component.set(props);

		assert.htmlEqual(target.innerHTML, '42');
	}
};