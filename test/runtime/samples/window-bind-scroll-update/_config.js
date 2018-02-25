export default {
	skip: true, // JSDOM

	test ( assert, component, target, window ) {
		assert.equal( window.pageYOffset, 0 );

		component.set({ scrollY: 100 });
		assert.equal( window.pageYOffset, 100 );

		component.destroy();
	}
};