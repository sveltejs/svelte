export default {
	snapshot(target) {
		const h1 = target.querySelector('h1');

		return {
			h1,
		};
	},

	test(assert, target, snapshot, component) {
		const h1 = target.querySelector('h1');

		assert.equal(h1, snapshot.h1);
		assert.equal(component.refs.h1, h1);
	}
};