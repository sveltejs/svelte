export default {
	snapshot(target) {
		const p = target.querySelector('#p');
		const h1 = target.querySelector('h1');

		return {
			p,
			h1
		};
	},

	test(assert, target, snapshot) {
		const p = target.querySelector('#p');
		const h1 = target.querySelector('h1');

		assert.equal(p, snapshot.p);
		assert.equal(h1, snapshot.h1);
	}
};
