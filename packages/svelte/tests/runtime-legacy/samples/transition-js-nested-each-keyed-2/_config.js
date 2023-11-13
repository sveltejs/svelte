import { test } from '../../test';

export default test({
	get props() {
		return { x: true, things: ['a', 'b'] };
	},

	test({ assert, component, target }) {
		component.x = false;
		assert.htmlEqual(target.innerHTML, '');
	}
});
