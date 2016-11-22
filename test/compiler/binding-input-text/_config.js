export default {
	data: {
		name: 'world'
	},
	html: `<input>\n<p>hello world</p>`,
	test ( assert, component, target, window ) {
		const input = target.querySelector( 'input' );
		assert.equal( input.value, 'world' );

		const event = new window.Event( 'input' );

		input.value = 'everybody';
		input.dispatchEvent( event );

		assert.equal( target.innerHTML, `<input>\n<p>hello everybody</p>` );

		component.set({ name: 'goodbye' });
		assert.equal( input.value, 'goodbye' );
		assert.equal( target.innerHTML, `<input>\n<p>hello goodbye</p>` );
	}
};
