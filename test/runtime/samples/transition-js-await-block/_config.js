let fulfil;
let reject;

let promise = new Promise((f, r) => {
	fulfil = f;
	reject = r;
});

export default {
	data: {
		promise
	},

	test(assert, component, target, window, raf) {
		component.set({ visible: true });
		let p = target.querySelector('p');

		assert.equal(p.className, 'pending');
		assert.equal(p.foo, 0);

		raf.tick(50);
		assert.equal(p.foo, 0);

		fulfil(42);
		raf.tick(80);
		let ps = document.querySelectorAll('p');
		assert.equal(p[0].className, 'pending');
		assert.equal(p[1].className, 'then');
		assert.equal(p[0].foo, 20);
		assert.equal(p[1].foo, 30);
	},
};
