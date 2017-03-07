export default {
	html: `<button>click me</button>`,

	data: {
		foo: 42
	},

	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'click' );
		const button = target.querySelector( 'button' );

		let count = 0;
		let number = null;

		component.on( 'foo', obj => {
			count++;
			number = obj.foo;
		});

		button.dispatchEvent( event );

		assert.equal( count, 1 );
		assert.equal( number, 42 );

		component.destroy();
	}
};