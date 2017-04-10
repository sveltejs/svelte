export default {
	data: {
		x: 10
	},

	html: 'potato',

	test ( assert, component, target ) {
		component.set({ x: 3 });
		assert.htmlEqual( target.innerHTML, 'potato' );
	}
};
