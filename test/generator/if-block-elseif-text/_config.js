export default {
	data: {
		x: 11
	},

	html: `
		before-if-after
	`,

	test ( assert, component, target ) {
		component.set({ x: 4 });
		assert.htmlEqual( target.innerHTML, `
			before-elseif-after
		` );

		component.set({ x: 6 });
		assert.htmlEqual( target.innerHTML, `
			before-else-after
		` );

		component.teardown();
	}
};
