import { test } from '../../test';

export default test({
	get props() {
		return { user: { active: true } };
	},

	html: '<div class="active"></div>',

	test({ assert, component, target }) {
		component.user = { active: false };

		assert.htmlEqual(target.innerHTML, `<div class></div>`);
	}
});
