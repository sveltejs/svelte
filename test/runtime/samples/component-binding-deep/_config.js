export default {
	html: `
		<input>
		<p>foo</p>
	`,

	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'input' );
		const input = target.querySelector( 'input' );

		input.value = 'blah';
		input.dispatchEvent( event );

		assert.deepEqual( component.get().deep, { name: 'blah' } );
		assert.htmlEqual( target.innerHTML, `
			<input>
			<p>blah</p>
		` );

		component.destroy();
	}
};
