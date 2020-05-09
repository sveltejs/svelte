export default {
	// This fails because the test checks for __value being set on the node, which
	// bind:group requires to work, but when a spread is used to set `value` on the
	// element, the code that also sets `__value` on the node is not triggered.
	// This is issue #4808.
	skip: true,

	props: {
		props: {
			'data-foo': 'bar',
			value: 'abc'
		}
	},

	html: `<input data-foo="bar" type="radio" value="abc">`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, 'abc');
		assert.equal(input.__value, 'abc');
	}
};
