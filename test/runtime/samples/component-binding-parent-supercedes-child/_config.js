export default {
	html: `
		<button>+1</button>
		<p>count: 10</p>
	`,

	test ( assert, component, target, window ) {
		const click = new window.MouseEvent( 'click' );
		const button = target.querySelector( 'button' );

		button.dispatchEvent( click );

		assert.equal( component.get().x, 11 );
		assert.htmlEqual( target.innerHTML, `
			<button>+1</button>
			<p>count: 11</p>
		` );

		button.dispatchEvent( click );

		assert.equal( component.get().x, 12 );
		assert.htmlEqual( target.innerHTML, `
			<button>+1</button>
			<p>count: 12</p>
		` );
	}
};
