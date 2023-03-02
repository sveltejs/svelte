export default {
	props: {
		foo: true,
		bar: true
	},

	snapshot(target) {
		const div = target.querySelector('div');
		const ps = target.querySelectorAll('p');

		return {
			div,
			p0: ps[0],
			p1: ps[1]
		};
	},

	test(assert, target, snapshot) {
		const div = target.querySelector('div');
		const ps = target.querySelectorAll('p');

		assert.equal(div, snapshot.div);
		assert.equal(ps[0], snapshot.p0);
		assert.equal(ps[1], snapshot.p1);
	}
};
