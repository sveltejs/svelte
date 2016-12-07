export default {
	data: {
		a: 1,
		b: 2
	},
	html: '<p>1 + 2 = 3</p>',
	test ( assert, component, target ) {
		component.set({ a: 3, b: 4 });
		assert.equal( target.innerHTML, '<p>3 + 4 = 7</p>' );
	}
};
