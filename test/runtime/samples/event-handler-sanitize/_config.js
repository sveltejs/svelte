export default {
	html: `
		<div>toggle</div>
	`,

	test ( assert, component, target, window ) {
		const div = target.querySelector( 'div' );
		const event = new window.MouseEvent( 'some-event' );

		div.dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `
			<div>toggle</div>
			<p>hello!</p>
		` );

		div.dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `
			<div>toggle</div>
		` );
	}
};
