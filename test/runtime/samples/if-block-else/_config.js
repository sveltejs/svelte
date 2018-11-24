export default {
	props: {
		foo: true,
		bar: false
	},

	html: `
		<p>foo</p>
		<p>not bar</p>
	`,

	test({ assert, component, target }) {
		component.foo = false;
		assert.htmlEqual( target.innerHTML, `
			<p>not foo</p>
			<p>not bar</p>
		` );

		component.bar = true;
		assert.htmlEqual( target.innerHTML, `
			<p>not foo</p>
			<p>bar</p>
		` );

		component.foo = true;
		assert.htmlEqual( target.innerHTML, `
			<p>foo</p>
			<p>bar</p>
		` );
	}
};
