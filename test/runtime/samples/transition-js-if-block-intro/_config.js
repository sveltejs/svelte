export default {
	test ( assert, component, target, window, raf ) {
		component.set({ visible: true });
		const div = target.querySelector( 'div' );
		assert.equal( window.getComputedStyle( div ).opacity, 0 );

		raf.tick( 200 );
		assert.equal( window.getComputedStyle( div ).opacity, 0.5 );

		raf.tick( 400 );
		assert.equal( window.getComputedStyle( div ).opacity, 1 );

		raf.tick( 500 );

		component.destroy();
	}
};