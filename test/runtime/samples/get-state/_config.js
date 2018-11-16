export default {
	test ( assert, component ) {
		assert.equal( component.a, 1 );
		assert.equal( component.c, 3 );
		assert.deepEqual( component.get(), { a: 1, b: 2, c: 3 });
	}
};
