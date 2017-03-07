export default {
	data: {
		thing: { a: 1 }
	},

	test ( assert, component ) {
		const thing = component.get( 'thing' );

		component.observe( 'thing', function ( thing ) {
			thing.b = thing.a * 2;
			this.set({ thing }); // triggers infinite loop, unless observer breaks it
		});

		assert.deepEqual( thing, {
			a: 1,
			b: 2
		});

		thing.a = 3;
		component.set({ thing });

		assert.deepEqual( thing, {
			a: 3,
			b: 6
		});
	}
};
