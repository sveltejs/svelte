import * as assert from 'assert';

export default {
	test ( component, target, window ) {
		const [ control, test ] = target.querySelectorAll( 'p' );

		assert.equal( window.getComputedStyle( control ).color, '' );
		assert.equal( window.getComputedStyle( test ).color, 'red' );
	}
};
