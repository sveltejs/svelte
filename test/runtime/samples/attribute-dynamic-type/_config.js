export default {
	'skip-ssr': true,

	data: {
		inputType: 'text',
		inputValue: 42
	},

	html: `<input type="text">`,

	test(assert, component, target) {
		const input = target.querySelector('input');
		assert.equal(input.type, 'text');
		assert.equal(input.value, '42');

		component.set({ inputType: 'number' });
		assert.equal(input.type, 'number');
	}
};
