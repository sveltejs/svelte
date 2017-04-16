export default {
	test ( assert, component ) {
		let count = 0;

		component.observe( 'bar', () => {
			count += 1;
		});

		component.set({ x: true });
		assert.equal( count, 1 );

		component.destroy();
	}
};
