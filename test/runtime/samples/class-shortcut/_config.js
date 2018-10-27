export default {
	data: {
		"is-active": true,
		isSelected: true
	},
	html: `<div class="is-active isSelected"></div>`,

	test ( assert, component, target, window ) {
		component.set({ "is-active": false });

		assert.htmlEqual( target.innerHTML, `
			<div class="isSelected"></div>
		` );
	}
};
