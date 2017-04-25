export default {
	html: `
		<button>destroy</button>
	`,

	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const event = new window.MouseEvent( 'click' );

		let destroyed = false;
		component.on( 'destroy', () => {
			destroyed = true;
		});

		button.dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `` );

		assert.ok( destroyed );
	}
};
