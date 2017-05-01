export default {
	data: {
		name: 'world'
	},

	test ( assert, component, target, window, raf ) {
		global.count = 0;

		component.set({ visible: true });
		assert.equal( global.count, 1 );
		const div = target.querySelector( 'div' );
		assert.equal( div.foo, 0 );

		raf.tick( 300 );
		component.set({ name: 'everybody' });
		assert.equal( div.foo, 0.75 );
		assert.htmlEqual( div.innerHTML, 'hello everybody!' );

		component.set({ visible: false, name: 'again' });
		assert.htmlEqual( div.innerHTML, 'hello everybody!' );

		raf.tick( 500 );
		assert.equal( div.foo, 0.25 );

		component.set({ visible: true });
		raf.tick( 700 );
		assert.equal( div.foo, 0.75 );
		assert.htmlEqual( div.innerHTML, 'hello again!' );

		raf.tick( 800 );
		assert.equal( div.foo, 1 );

		raf.tick( 900 );

		component.destroy();
	}
};