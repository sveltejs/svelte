export default {
	props: {
		thing: 'foo'
	},

	html: '<p>i am foo</p>',

	test({ assert, component, target }) {
		assert.htmlEqual( target.innerHTML, '<p>i am foo</p>' );
		component.thing = 'bar';
		assert.htmlEqual( target.innerHTML, '<p>i am bar</p>' );
		component.thing = 'no-match';
		assert.htmlEqual( target.innerHTML, '<p>i am default</p>' );
	}
};
