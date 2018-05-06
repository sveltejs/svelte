export default {
	data: {
		foo: 1
	},

	html: `<div>1</div>`,

	test(assert, component) {
		component.destroy();
		const { foo } = component.get();
		assert.equal(foo, undefined);
	}
}