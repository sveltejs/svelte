export default {
	html: '<canvas></canvas>',
	test ( assert, component, target ) {
		const canvas = target.querySelector( 'canvas' );
		assert.equal( canvas, component.refs.foo );
	}
};
