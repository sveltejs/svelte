export default {
	nestedTransitions: true,
	transitions: {
		intro: false,
		outro: false,
		duration: 100,
	},

	data: {
		x: false,
		y: true
	},

	test(assert, component, target, window, raf) {
		component.set({ x: true });

		let div = target.querySelector('div');
		assert.equal(div.foo, undefined);

		component.set({ y: false });
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = target.querySelector('div');

		raf.tick(50);
		assert.equal(div.foo, 0.5);

		raf.tick(100);
		assert.htmlEqual(target.innerHTML, '');

		component.set({ x: false, y: true });
		assert.htmlEqual(target.innerHTML, '');

		component.set({ x: true });
		assert.htmlEqual(target.innerHTML, '<div></div>');
		div = target.querySelector('div');

		component.set({ y: false });
		assert.htmlEqual(target.innerHTML, '<div></div>');

		raf.tick(150);
		assert.equal(div.foo, 0.5);

		raf.tick(200);
		assert.htmlEqual(target.innerHTML, '');
	},
};
