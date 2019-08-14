export default {
	skip_if_ssr: true,

	props: {
		inputType: 'text',
		inputValue: 42
	},

	html: '<input type="text">',

	test({ assert, component, target }) {
		const input = target.querySelector('input');
		assert.equal(input.type, 'text');
		assert.equal(input.value, '42');

		component.inputType = 'number';
		assert.equal(input.type, 'number');
	}
};
