export default {
	props: {
		props: {
			'data-foo': 'bar'
		}
	},

	html: `<input data-foo="bar" type="radio" value="abc">`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, 'abc');
		assert.equal(input.__value, 'abc');
	}
};
