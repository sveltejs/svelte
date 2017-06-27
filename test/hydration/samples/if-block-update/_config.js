export default {
	data: {
		foo: true,
		bar: false
	},

	snapshot(target) {
		const p = target.querySelector('p');

		return {
			p
		};
	},

	test(assert, target, snapshot, component) {
		const p = target.querySelector('p');

		assert.equal(p, snapshot.p);

		component.set({ foo: false, bar: true });
		assert.htmlEqual(target.innerHTML, `<p>bar!</p>`);
	}
};