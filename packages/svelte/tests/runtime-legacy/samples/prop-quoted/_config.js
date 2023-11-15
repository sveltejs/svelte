import { test } from '../../test';

export default test({
	get props() {
		return { foo: 1 };
	},

	html: '1',

	async test({ assert, component, target }) {
		component.foo = 2;
		assert.htmlEqual(target.innerHTML, '2');
	}
});
