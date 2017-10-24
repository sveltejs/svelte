const data = { foo: 0 };

export default {
	data,

	html: '0',

	test(assert, component, target) {
		data.foo = 42;
		component.set(data);

		assert.htmlEqual(target.innerHTML, '42');
	}
};