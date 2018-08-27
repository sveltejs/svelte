export default {
	containedTransitions: true,
	nestedTransitions: true,

	data: {
		x: false,
		y: true
	},

	test(assert, component, target, window, raf) {
		component.set({ x: true });

		let div = target.querySelector('div');
		assert.equal(div.foo, undefined);

		raf.tick(100);
		assert.equal(div.foo, undefined);
		assert.htmlEqual(target.innerHTML, '<div></div>');

		component.set({ y: false });
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(150);
		assert.equal(div.foo, 0.5);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');

		component.set({ x: false, y: true });
		assert.htmlEqual(target.innerHTML, '');

		component.set({ x: true });
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = target.querySelector('div');

		component.set({ y: false });
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(250);
		assert.equal(div.foo, 0.5);

		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '');
	},
};
