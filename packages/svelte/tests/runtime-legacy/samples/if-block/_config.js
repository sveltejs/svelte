import { test } from '../../test';

export default test({
	get props() {
		return { visible: true };
	},

	html: '<p>i am visible</p>',

	test({ assert, component, target }) {
		component.visible = false;
		assert.htmlEqual(target.innerHTML, '');
		component.visible = true;
		assert.htmlEqual(target.innerHTML, '<p>i am visible</p>');
	}
});
