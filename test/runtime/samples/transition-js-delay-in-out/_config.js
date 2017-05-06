export default {
	test ( assert, component, target, window, raf ) {
		component.set({ visible: true });
		const div = target.querySelector( 'div' );
		assert.equal( div.foo, 0 );

		raf.tick( 50 );
		assert.equal( div.foo, 0 );

		raf.tick( 150 );
		assert.equal( div.foo, 1 );

		component.set({ visible: false });
		assert.equal( div.bar, undefined );

		raf.tick( 200 );
		assert.equal( div.bar, 1 );

		raf.tick( 300 );
		assert.equal( div.bar, 0 );

		component.destroy();
	}
};