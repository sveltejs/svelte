export default {
	test ( assert, component, target, window, raf ) {
		assert.equal( target.querySelector( 'div' ), component.refs.no );
		assert.equal( component.refs.no.foo, 0 );

		raf.tick( 200 );
		assert.equal( component.refs.no.foo, 0.5 );

		raf.tick( 500 );
		component.set({ x: true });
		assert.equal( component.refs.no, undefined );
		assert.equal( component.refs.yes.foo, 0 );

		raf.tick( 700 );
		assert.equal( component.refs.yes.foo, 0.5 );

		raf.tick( 1000 );

		component.destroy();
	}
};