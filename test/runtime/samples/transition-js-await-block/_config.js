let fulfil;
let reject;

let promise = new Promise((f, r) => {
	fulfil = f;
	reject = r;
});

export default {
	solo: 1,

	data: {
		promise
	},

	test(assert, component, target, window, raf) {
		component.set({ visible: true });
		let p = target.querySelector('p');

		assert.equal(p.className, 'pending');
		assert.equal(p.foo, 0);

		raf.tick(50);
		assert.equal(p.foo, 0.5);

		fulfil(42);

		return promise.then(() => {
			raf.tick(80);
			let ps = document.querySelectorAll('p');
			assert.equal(ps[0].className, 'pending');
			assert.equal(ps[1].className, 'then');
			assert.equal(ps[0].foo, 0.2);
			assert.equal(ps[1].foo, 0.3);
		});
	}
};
