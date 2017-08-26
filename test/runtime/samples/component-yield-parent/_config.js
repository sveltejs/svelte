export default {
	html: `
		<div><p><slot>Hello</slot></p></div>
	`,

	test ( assert, component, target ) {
		assert.equal( component.get( 'data' ), 'Hello' );

		component.set({ data: 'World' });
		assert.equal( component.get( 'data' ), 'World' );
		assert.htmlEqual( target.innerHTML, `
			<div><p><slot>World</slot></p></div>
		` );
	}
};
