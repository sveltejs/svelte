export default {
	html: '<div data-named="value" data-foo="bar">red</div>',

	test({ assert, component, target }) {
		const div = target.querySelector('div');

		assert.equal(div.dataset.foo, 'bar');
		assert.equal(div.dataset.named, 'value');

		component.color = 'blue';
		component.props = { 'data-foo': 'baz', 'data-named': 'qux' };
		assert.htmlEqual(target.innerHTML, '<div data-named="value" data-foo="baz">blue</div>');
		assert.equal(div.dataset.foo, 'baz');
		assert.equal(div.dataset.named, 'value');

		component.color = 'blue';
		component.props = {};
		assert.htmlEqual(target.innerHTML, '<div data-named="value">blue</div>');
		assert.equal(div.dataset.foo, undefined);
	}
};
