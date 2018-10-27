export default {
	html: '<p>1 + 2 = 3</p>\n<p>3 * 3 = 9</p>',
	test ( assert, component, target ) {
		component.set({ a: 3 });
		assert.equal( component.get().c, 5 );
		assert.equal( component.get().cSquared, 25 );
		assert.equal( target.innerHTML, '<p>3 + 2 = 5</p>\n<p>5 * 5 = 25</p>' );
		component.destroy();
	}
};
