export default {
	test ( assert, component, target, window, raf ) {
		component.set({ visible: true });
		const div = target.querySelector( 'div' );
		assert.strictEqual( div.style.opacity, '0' );

		raf.tick( 50 );
		assert.strictEqual( div.style.opacity, '' );

		component.destroy();
	}
};