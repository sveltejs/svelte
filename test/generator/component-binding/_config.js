export default {
	'skip-ssr': true, // TODO delete this line, once binding works

	html: `
		<button>+1</button>
		<p>count: 0</p>
	`,

	test ( assert, component, target, window ) {
		const click = new window.MouseEvent( 'click' );
		const button = target.querySelector( 'button' );

		button.dispatchEvent( click );

		assert.equal( component.get( 'x' ), 1 );
		assert.htmlEqual( target.innerHTML, `
			<button>+1</button>
			<p>count: 1</p>
		` );

		button.dispatchEvent( click );

		assert.equal( component.get( 'x' ), 2 );
		assert.htmlEqual( target.innerHTML, `
			<button>+1</button>
			<p>count: 2</p>
		` );
	}
};
