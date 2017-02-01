export default {
	html: '<p>2</p>',

	test ( assert, component, target ) {
		component.set({ a: 2 });
		assert.equal( target.innerHTML, '<p>4</p>' );
		component.teardown();
	}
};
