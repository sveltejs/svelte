export default {
	html: '<div><p>Hello</p></div>',
	test ( assert, component, target ) {
		assert.equal( component.get( 'data' ), 'Hello' );
		component.set({data: 'World'})
		assert.equal( component.get( 'data' ), 'World' );
		assert.equal( target.innerHTML, '<div><p>World<!--yield--></p></div>' );
	}
}
