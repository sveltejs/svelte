export default {
	skip: true, // JSDOM

	test ( assert, component, target, window ) {
		assert.equal( window.scrollY, 0 );

		component.set({ scrollY: 100 });
		assert.equal( window.scrollY, 100 );

		component.destroy();
	}
};