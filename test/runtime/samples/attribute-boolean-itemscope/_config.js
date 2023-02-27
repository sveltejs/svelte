export default {
	props: {
		itemscope: true
	},
	test({ assert, target, component }) {
		const div = target.querySelector('div');
		assert.ok(div.itemscope);
		component.itemscope = false;
		assert.ok(!div.itemscope);
	}
};
