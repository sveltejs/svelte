import * as assert from 'assert';

export default {
	html: '<canvas></canvas>',
	test ( component, target ) {
		const canvas = target.querySelector( 'canvas' );
		assert.equal( canvas, component.refs.foo );
	}
};
