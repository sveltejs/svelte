export default {
	// solo: true,

	test ( assert, component, target, window ) {
		const [ control, test ] = target.querySelectorAll( 'p' );

		assert.equal( window.getComputedStyle( control ).color, '' );
		assert.equal( window.getComputedStyle( control ).backgroundColor, '' );

		assert.equal( window.getComputedStyle( test ).color, 'red' );
		assert.equal( window.getComputedStyle( test ).backgroundColor, 'black' );
	}
};
