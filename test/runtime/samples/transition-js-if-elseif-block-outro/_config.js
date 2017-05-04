export default {
	data: {
		x: false,
		y: true
	},

	test ( assert, component, target, window, raf ) {
		assert.equal( target.querySelector( 'div' ), component.refs.no );

		component.set({ x: true, y: false });

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