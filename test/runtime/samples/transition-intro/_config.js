export default {
	test ( assert, component, target, window ) {
		let now = 0;
		let callback;

		window.performance = { now: () => now };
		window.requestAnimationFrame = cb => callback = cb;

		component.set({ visible: true });
		const div = target.querySelector( 'div' );
		assert.equal( window.getComputedStyle( div ).opacity, 0 );

		now = 200;
		callback();
		assert.equal( window.getComputedStyle( div ).opacity, 0.5 );

		now = 400;
		callback();
		assert.equal( window.getComputedStyle( div ).opacity, 1 );

		component.destroy();
	}
};