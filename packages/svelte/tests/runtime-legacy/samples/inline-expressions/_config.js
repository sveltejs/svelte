import { test } from '../../test';

export default test({
	get props() {
		return { a: 1, b: 2 };
	},
	html: '<p>1 + 2 = 3</p>',
	test({ assert, component, target }) {
		component.a = 3;
		component.b = 4;
		assert.htmlEqual(target.innerHTML, '<p>3 + 4 = 7</p>');
	}
});
