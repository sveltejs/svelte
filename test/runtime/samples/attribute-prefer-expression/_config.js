export default {
	'skip-ssr': true,

	data: {
		foo: false
	},

	test ( assert, component, target ) {
		const inputs = target.querySelectorAll( 'input' );

		assert.ok( inputs[0].checked );
		assert.ok( !inputs[1].checked );

		component.set( { foo: true } );

		assert.ok( !inputs[0].checked );
		assert.ok( inputs[1].checked );
	}
};
