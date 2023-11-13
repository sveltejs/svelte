import { ok, test } from '../../test';

export default test({
	get props() {
		return { inputType: 'text', inputValue: 42 };
	},

	html: '<input type="text">',
	ssrHtml: '<input type="text" value="42">',

	test({ assert, component, target }) {
		const input = target.querySelector('input');
		ok(input);

		assert.equal(input.type, 'text');
		assert.equal(input.value, '42');

		component.inputType = 'number';
		Promise.resolve();
		assert.equal(input.type, 'number');
	}
});
