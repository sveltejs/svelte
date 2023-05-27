const items = [{ id: 'a' }, { id: 'b' }];

export default {
	skip_if_ssr: true,

	get props() {
		return { items };
	},

	test({ assert, component }) {
		const items = component.items;

		assert.equal(items[0].id, 'a');
		assert.equal(items[1].id, 'b');
	}
};
