export default {
	data: {
		x: 10
	},

	html: '5',

	test ( assert, component, target ) {
		component.set({ x: 3 });
		assert.htmlEqual( target.innerHTML, '3' );
	}
};
