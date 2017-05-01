export default {
	test ( assert, component, target, window ) {
		global.count = 0;
		let now = 0;
		let callback;

		window.performance = { now: () => now };
		global.requestAnimationFrame = cb => callback = cb;

		component.set({ visible: true });
		assert.equal( global.count, 1 );
		const div = target.querySelector( 'div' );
		assert.equal( div.foo, 0 );

		now = 300;
		callback();
		assert.equal( div.foo, 0.75 );

		component.set({ visible: false });
		assert.equal( global.count, 1 );

		now = 500;
		callback();
		assert.equal( div.foo, 0.25 );

		component.set({ visible: true });
		now = 700;
		callback();
		assert.equal( div.foo, 0.75 );

		now = 800;
		callback();
		assert.equal( div.foo, 1 );

		now = 900;
		callback();

		component.destroy();
	}
};