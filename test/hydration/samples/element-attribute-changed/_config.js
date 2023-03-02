export default {
	props: {
		class: 'bar'
	},

	snapshot(target) {
		const div = target.querySelector('div');

		return {
			div
		};
	},

	test(assert, target, snapshot) {
		const div = target.querySelector('div');

		assert.equal(div, snapshot.div);
	}
};
