let fulfil;

const promise = new Promise(f => {
	fulfil = f;
});

export default {
	containedTransitions: true,
	nestedTransitions: true,

	data: {
		x: false,
		promise
	},

	test(assert, component, target, window, raf) {
		component.set({ x: true });
		fulfil();

		return promise.then(() => {
			const div = target.querySelector('div');
			assert.equal(div.foo, 0);

			raf.tick(100);
			assert.equal(div.foo, 1);

			component.set({ x: false });
			assert.htmlEqual(target.innerHTML, '');

			raf.tick(150);
			assert.equal(div.foo, 1);
		});
	}
};
