export default {
	test ( assert, component ) {
		let count = 0;

		const expected = { x: 1 };

		component.on( 'foo', data => {
			assert.equal( data, expected );
			count += 1;
		});

		component.fire( 'foo', expected );
		assert.equal( count, 1 );

		component.destroy();
	}
};
