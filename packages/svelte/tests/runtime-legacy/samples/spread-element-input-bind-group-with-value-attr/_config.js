import { test } from '../../test';

export default test({
	get props() {
		return { props: { 'data-foo': 'bar' } };
	},

	html: '<input data-foo="bar" type="radio" value="abc">',

	async test({ assert, target }) {
		const input = /** @type {HTMLInputElement & { __value: string }} */ (
			target.querySelector('input')
		);
		assert.equal(input.value, 'abc');
		assert.equal(input.__value, 'abc');
	}
});
