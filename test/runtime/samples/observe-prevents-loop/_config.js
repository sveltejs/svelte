export default {
	data: {
		thing: { a: 1 }
	},

	test(assert, component) {
		const thing = component.get().thing;

		component.on('state', ({ changed, current }) => {
			if (changed.thing) {
				const { thing } = current;
				thing.b = thing.a * 2;
				component.set({ thing }); // triggers infinite loop, unless event handler breaks it
			}
		});

		assert.deepEqual(thing, {
			a: 1
		});

		thing.a = 3;
		component.set({ thing });

		assert.deepEqual(thing, {
			a: 3,
			b: 6
		});
	}
};
