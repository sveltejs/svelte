export default {
	props: {
		myClass: 'one two',
		attributes: {
			role: 'button'
		}
	},

	html: '<div class="one two three" role="button"></div>',

	test({ assert, component, target }) {
		component.myClass = 'one';
		component.attributes = {
			'aria-label': 'Test'
		};

		assert.htmlEqual(target.innerHTML, `
			<div class="one three" aria-label="Test"></div>
		`);
	}
};
