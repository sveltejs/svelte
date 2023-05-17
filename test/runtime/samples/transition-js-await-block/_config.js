let fulfil;

let promise;

export default {
	get props() {
		promise = new Promise((f) => {
			fulfil = f;
		});
		return { promise };
	},

	intro: true,

	test({ assert, target, raf }) {
		const p = target.querySelector('p');

		assert.equal(p.className, 'pending');
		assert.equal(p.foo, 0);

		raf.tick(50);
		assert.equal(p.foo, 0.5);

		fulfil(42);

		return promise.then(() => {
			raf.tick(80);
			const ps = document.querySelectorAll('p');
			assert.equal(ps[1].className, 'pending');
			assert.equal(ps[0].className, 'then');
			assert.equal(ps[1].foo, 0.2);
			assert.equal(ps[0].foo, 0.3);
			raf.tick(100);
		});
	}
};
