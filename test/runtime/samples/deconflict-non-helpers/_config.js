export default {
	html: `ABCD`,

	test ( assert, component ) {
		assert.equal( component.get().compute, 'ABCD' );
		component.destroy();
	}
};
