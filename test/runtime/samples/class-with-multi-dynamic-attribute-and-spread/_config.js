export default {
	props: {
		myClass: 'one two',
		attributes: {
			role: 'button'
		}
	},

	html: `<div class="one two three four" role="button"></div>`,

	test({ assert, component, target, window }) {
		component.myClass = 'one';
		component.attributes = {
			'aria-label': 'Test'
		};

		assert.htmlEqual(target.innerHTML, `
			<div class="one three four" aria-label="Test"></div>
		`);
	}
};
