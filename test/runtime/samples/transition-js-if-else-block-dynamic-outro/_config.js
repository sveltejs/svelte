export default {
	data: {
		z: 'z'
	},

	test ( assert, component, target, window, raf ) {
		assert.equal( target.querySelector( 'div' ), component.refs.no );

		component.set({ x: true });

		raf.tick( 25 );
		assert.equal( component.refs.yes.foo, undefined );
		assert.equal( component.refs.no.foo, 0.75 );

		raf.tick( 75 );
		assert.equal( component.refs.yes.foo, undefined );
		assert.equal( component.refs.no.foo, 0.25 );

		raf.tick( 100 );
		component.destroy();
	}
};