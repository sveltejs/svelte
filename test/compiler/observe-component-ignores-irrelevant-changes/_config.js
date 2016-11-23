export default {
	test ( assert, component ) {
		const foo = component.refs.foo;
		let count = 0;

		foo.observe( 'x', () => {
			count += 1;
		});

		assert.equal( count, 1 );

		component.set({ y: {} });
		assert.equal( count, 1 );
	}
};
