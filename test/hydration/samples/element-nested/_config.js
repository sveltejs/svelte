export default {
	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div,
			p: div.querySelector('p')
		};
	},

	test(assert, target, snapshot) {
		const div = target.querySelector('div');

		assert.equal(div, snapshot.div);
		assert.equal(div.querySelector('p'), snapshot.p);
	}
};
