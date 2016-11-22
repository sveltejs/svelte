export default {
	data: {
		foo: true,
		bar: false
	},

	html: `
		<p>foo</p>
		<p>not bar</p>
	`,

	test ( assert, component, target ) {
		component.set({ foo: false });
		assert.htmlEqual( target.innerHTML, `
			<p>not foo</p>
			<p>not bar</p>
		` );

		component.set({ bar: true });
		assert.htmlEqual( target.innerHTML, `
			<p>not foo</p>
			<p>bar</p>
		` );

		component.set({ foo: true });
		assert.htmlEqual( target.innerHTML, `
			<p>foo</p>
			<p>bar</p>
		` );
	}
};
