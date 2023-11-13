import { test } from '../../test';

export default test({
	get props() {
		return {
			/** @type {string[]} */
			items: []
		};
	},

	html: '',

	test({ assert, component, target }) {
		component.items = ['x'];
		assert.htmlEqual(target.innerHTML, 'foo');
	}
});
