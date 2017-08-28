export default {
	html: `
		<b>Hello</b>
	`,

	test ( assert, component, target ) {
		component.set( { name: 'World' } );
		assert.htmlEqual( target.innerHTML, `
			<b>Hello</b> World
		` );
	}
};
