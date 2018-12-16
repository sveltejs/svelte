export default {
	props: {
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

		component.foo = false;
		component.bar = true;
		assert.htmlEqual(target.innerHTML, `<p>bar!</p>`);
	}
};