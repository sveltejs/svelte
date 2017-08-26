export default {
	html: `
		<b><slot>Hello</slot></b>
	`,

	test ( assert, component, target ) {
		component.set( { name: 'World' } );
		assert.htmlEqual( target.innerHTML, `
			<b><slot>Hello</slot></b> World
		` );
	}
};
