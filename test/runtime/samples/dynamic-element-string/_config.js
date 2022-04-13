export default {
	html: '<div>Foo</div>',

	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML,	'<div>Foo</div>');
	}
};
