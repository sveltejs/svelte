import { test } from '../../test';

export default test({
	get props() {
		return { myClass: 'one two' };
	},

	html: '<div class="one two three"></div>',

	test({ assert, component, target }) {
		component.myClass = 'one';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="one three"></div>
		`
		);
	}
});
