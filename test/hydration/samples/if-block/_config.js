export default {
	props: {
		foo: true
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	},

	test(assert, target, snapshot) {
		const p = target.querySelector('p');

		assert.equal(p, snapshot.p);
	}
};