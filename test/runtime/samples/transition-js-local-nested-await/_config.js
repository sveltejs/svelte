let fulfil;

const promise = new Promise((f) => {
	fulfil = f;
});

export default {
	props: {
		x: false,
		promise,
	},

	test({ assert, component, target, raf }) {
		component.x = true;
		fulfil();

		return promise.then(() => {
			const div = target.querySelector('div');
			assert.equal(div.foo, undefined);
			raf.tick(1);
			assert.equal(Math.round(div.foo * 100) / 100, 0.01);

			raf.tick(100);
			assert.equal(div.foo, 1);

			component.x = false;
			assert.htmlEqual(target.innerHTML, '');

			raf.tick(150);
			assert.equal(div.foo, 1);
		});
	},
};
