export default {
	html: 'a',
	test({ assert, component, target }) {
		component.a = 'foo';
		assert.htmlEqual(target.innerHTML, 'foo');

		component.condition = 2;
		assert.htmlEqual(target.innerHTML, 'foo + b = foob');

		component.b = 'bar';
		assert.htmlEqual(target.innerHTML, 'foo + bar = foobar');
		
		component.condition = 3;
		assert.htmlEqual(target.innerHTML, 'b: bar');
		
		component.condition = 4;
		assert.htmlEqual(target.innerHTML, 'value');
		
		component.value = 'xxx';
		assert.htmlEqual(target.innerHTML, 'xxx');

		component.condition = 2;
		component.b = 'baz';
		component.a = 'qux';
		assert.htmlEqual(target.innerHTML, 'qux + baz = quxbaz');		
	}
};
