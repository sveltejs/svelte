export default {
	data: {
		myClass: 'one two',
		attributes: {
			role: 'button'
		}
	},
	html: `<div class="one two" role="button"></div>`,

	test ( assert, component, target, window ) {
		component.set({
			attributes: {
				'aria-label': 'Test'
			},
			myClass: 'one'
		});

		assert.htmlEqual( target.innerHTML, `
			<div class="one" aria-label="Test"></div>
		` );
	}
};
