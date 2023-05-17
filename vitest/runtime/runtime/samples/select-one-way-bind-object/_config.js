const items = [{}, {}];

export default {
	skip_if_ssr: true,

	get props() {
		return { foo: items[0], items };
	},

	test({ assert, component, target }) {
		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);

		component.foo = items[1];

		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
	}
};
