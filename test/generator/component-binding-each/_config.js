export default {
	html: `
		<input><input><input>
		<p>foo, bar, baz</p>
	`,

	test ( assert, component, target, window ) {
		const change = new window.MouseEvent( 'change' );
		const inputs = target.querySelectorAll( 'input' );

		inputs[0].value = 'blah';
		inputs[0].dispatchEvent( change );

		assert.deepEqual( component.get( 'a' ), [ 'blah', 'bar', 'baz' ] );
		assert.htmlEqual( target.innerHTML, `
			<input><input><input>
			<p>blah, bar, baz</p>
		` );
		
		component.teardown();
	}
};
