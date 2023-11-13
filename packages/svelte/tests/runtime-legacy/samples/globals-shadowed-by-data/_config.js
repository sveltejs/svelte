import { test } from '../../test';

export default test({
	get props() {
		return { x: 10 };
	},

	html: 'potato',

	test({ assert, component, target }) {
		component.x = 3;
		assert.htmlEqual(target.innerHTML, 'potato');
	}
});
