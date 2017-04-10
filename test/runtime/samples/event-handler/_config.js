export default {
	html: `
		<button>toggle</button>
	`,

	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const event = new window.MouseEvent( 'click' );

		button.dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `
			<button>toggle</button>
			<p>hello!</p>
		` );

		button.dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `
			<button>toggle</button>
		` );
	}
};
