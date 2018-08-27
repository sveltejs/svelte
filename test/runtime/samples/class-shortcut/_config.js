export default {
	data: {
		"is-active": true,
		isSelected: true,
		myClass: 'one two'
	},
	html: `<div class="one two is-active isSelected"></div>`,

	test ( assert, component, target, window ) {
		component.set({ "is-active": false });

		assert.htmlEqual( target.innerHTML, `
			<div class="one two isSelected"></div>
		` );
	}
};
