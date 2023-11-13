import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {number | null} */
			foo: null
		};
	},

	html: 'foo is ',

	test({ assert, component, target }) {
		component.foo = 42;
		assert.htmlEqual(target.innerHTML, 'foo is 42');

		component.foo = null;
		assert.htmlEqual(target.innerHTML, 'foo is ');
	}
});
