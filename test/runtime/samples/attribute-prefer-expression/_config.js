export default {

	props: {
		foo: false
	},

	test({ assert, component, target }) {
		const inputs = target.querySelectorAll('input');

		assert.ok(inputs[0].checked);
		assert.ok(!inputs[1].checked);

		component.foo = true;

		assert.ok(!inputs[0].checked);
		assert.ok(inputs[1].checked);
	}
};
