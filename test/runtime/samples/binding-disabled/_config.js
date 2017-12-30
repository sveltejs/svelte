export default {
	data: {
		name: 'world'
	},
	compileOptions: {
		bind: false
	},
	html: `<input>\n<p>hello world</p>`,
	test ( assert, component, target, window ) {
		const input = target.querySelector( 'input' );
		assert.equal( input.value, '' );

		const event = new window.Event( 'input' );

		input.value = 'everybody';
		input.dispatchEvent( event );

		assert.equal( target.innerHTML, `<input>\n<p>hello world</p>` );
	}
};
