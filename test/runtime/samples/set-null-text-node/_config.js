const data = { foo: null };

export default {
	data,

	html: '',

	test(assert, component, target) {
		assert.htmlEqual(target.innerHTML, 'hi there');

		data.foo = 'friend';
		component.set(data);

		assert.htmlEqual(target.innerHTML, 'hi there friend');

		data.foo = null;
		component.set(data);

		assert.htmlEqual(target.innerHTML, 'hi there');

	}
};