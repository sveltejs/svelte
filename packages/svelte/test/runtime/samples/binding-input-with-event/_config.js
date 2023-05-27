export default {
	get props() {
		return { a: 42 };
	},

	test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, '42');

		const event = new window.Event('input');

		input.value = 43;
		input.dispatchEvent(event);

		assert.equal(input.value, '43');
		assert.equal(component.a, 43);
	}
};
