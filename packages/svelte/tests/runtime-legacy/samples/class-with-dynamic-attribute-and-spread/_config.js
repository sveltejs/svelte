import { test } from '../../test';

export default test({
	get props() {
		return {
			myClass: 'one two',
			/** @type {Record<string, any>} */
			attributes: { role: 'button' }
		};
	},

	html: '<div class="one two three" role="button"></div>',

	test({ assert, component, target }) {
		component.myClass = 'one';
		component.attributes = {
			'aria-label': 'Test'
		};

		assert.htmlEqual(
			target.innerHTML,
			`
			<div class="one three" aria-label="Test"></div>
		`
		);
	}
});
