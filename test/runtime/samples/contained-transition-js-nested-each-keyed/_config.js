export default {
	containedTransitions: true,
	nestedTransitions: true,

	data: {
		x: false,
		things: ['a']
	},

	test(assert, component, target, window, raf) {
		component.set({ x: true });

		const div1 = target.querySelector('div');
		assert.equal(div1.foo, undefined);

		raf.tick(100);
		assert.equal(div1.foo, undefined);

		component.set({ things: ['a', 'b'] });
		assert.htmlEqual(target.innerHTML, '<div></div><div></div>');

		const div2 = target.querySelector('div:last-child');
		assert.equal(div1.foo, undefined);
		assert.equal(div2.foo, 0);

		raf.tick(200);
		assert.equal(div1.foo, undefined);
		assert.equal(div2.foo, 1);

		component.set({ x: false });
		assert.htmlEqual(target.innerHTML, '');
	},
};
