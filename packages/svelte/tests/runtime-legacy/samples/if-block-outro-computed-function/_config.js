import { test } from '../../test';

export default test({
	get props() {
		return { foo: true };
	},

	html: 'foo',

	test({ assert, component, target }) {
		component.foo = false;
		assert.htmlEqual(target.innerHTML, 'bar');
	}
});
