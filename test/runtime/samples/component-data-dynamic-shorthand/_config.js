export default {
	props: {
		foo: 42
	},

	html: `<div><p>foo: 42</p></div>`,

	test({ assert, component, target }) {
		component.foo = 99;

		assert.equal( target.innerHTML, `<div><p>foo: 99</p></div>` );
	}
};
