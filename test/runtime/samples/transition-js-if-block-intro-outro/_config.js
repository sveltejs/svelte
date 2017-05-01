export default {
	test ( assert, component, target, window ) {
		let now = 0;
		let callback;

		window.performance = { now: () => now };
		global.requestAnimationFrame = cb => callback = cb;

		component.set({ visible: true });
		let div = target.querySelector( 'div' );
		assert.equal( div.foo, 0 );

		now = 200;
		callback();
		assert.equal( div.foo, 0.5 );

		now = 400;
		callback();
		assert.equal( div.foo, 1 );

		now = 500;
		callback();
		assert.equal( div.foo, 1 );

		component.set({ visible: false });
		now = 600;
		callback();
		assert.equal( div.foo, 1 );
		assert.equal( div.bar, 0.75 );

		now = 900;
		callback();
		assert.equal( div.foo, 1 );
		assert.equal( div.bar, 0 );

		// test outro before intro complete
		now = 1000;
		component.set({ visible: true });
		div = target.querySelector( 'div' );
		callback();

		now = 1200;
		callback();
		assert.equal( div.foo, 0.5 );

		component.set({ visible: false });
		now = 1300;
		callback();
		assert.equal( div.foo, 0.75 );
		assert.equal( div.bar, 0.75 );

		now = 1400;
		callback();
		assert.equal( div.foo, 1 );
		assert.equal( div.bar, 0.5 );

		now = 2000;
		callback();

		component.destroy();
	}
};