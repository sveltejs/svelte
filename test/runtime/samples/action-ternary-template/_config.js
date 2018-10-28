export default {
	data: {
		target: 'World!',
		display: true,
	},

	html: `
		<h1></h1>
	`,

	test ( assert, component, target, window ) {
		const header = target.querySelector( 'h1' );
		const eventClick = new window.MouseEvent( 'click' );

		header.dispatchEvent( eventClick );
		assert.htmlEqual( target.innerHTML, `
			<h1>Hello World!</h1>
		` );
	}
};
