export default {
	get props() {
		return { props: { 'data-foo': 'bar' } };
	},

	html: '<input data-foo="bar" type="radio" value="abc">',

	async test({ assert, target }) {
		const input = target.querySelector('input');
		assert.equal(input.value, 'abc');
		assert.equal(input.__value, 'abc');
	}
};
