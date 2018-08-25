export default {
	data: {
		isActive: true,
		isSelected: true,
		myClass: 'one two'
	},
	html: `<div class="one two is-active isSelected"></div>`,

	test ( assert, component, target, window ) {
		component.set({ isActive: false });

		assert.htmlEqual( target.innerHTML, `
			<div class="one two isSelected"></div>
		` );
	}
};
