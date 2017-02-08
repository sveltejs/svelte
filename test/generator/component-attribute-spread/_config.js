export default {
	html: `
		<p>foo: 1</p>
		<p>bar: 2</p>
	`,

	test ( assert, component, target ) {
		component.set({
			options: {
				foo: 3,
				bar: 4
			}
		});

		assert.equal( component.refs.widget.get( 'foo' ), 3 );
		assert.htmlEqual( target.innerHTML, `
			<p>foo: 3</p>
			<p>bar: 4</p>
		` );
		component.teardown();
	}
};
