export default {
	html: '<p>2</p>',

	test ( assert, component, target ) {
		component.set({ y: 2 });
		assert.equal( component.get( 'x' ), 4 );
		assert.equal( target.innerHTML, '<p>4</p>' );
		component.destroy();
	}
};
