export default {
	data: {
		x: true
	},

	html: '<canvas data-x="true"></canvas>',

	test ( assert, component, target ) {
		let canvas = target.querySelector( 'canvas' );
		assert.equal( canvas, component.refs.foo );
		assert.equal( canvas.getAttribute( 'data-x' ), 'true' );

		component.set({ x: false });
		canvas = target.querySelector( 'canvas' );
		assert.equal( canvas, component.refs.foo );
		assert.equal( canvas.getAttribute( 'data-x' ), 'false' );

		component.set({ x: true });
		canvas = target.querySelector( 'canvas' );
		assert.equal( canvas, component.refs.foo );
		assert.equal( canvas.getAttribute( 'data-x' ), 'true' );
	}
};
