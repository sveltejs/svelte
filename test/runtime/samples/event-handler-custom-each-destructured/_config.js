export default {
	html: `
		<button>0: foo</button>
		<button>1: bar</button>
		<button>2: baz</button>

		<p>first: </p>
		<p>second: </p>
	`,

	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'click' );

		const buttons = target.querySelectorAll( 'button' );

		buttons[1].dispatchEvent( event );

		assert.htmlEqual( target.innerHTML, `
			<button>0: foo</button>
			<button>1: bar</button>
			<button>2: baz</button>

			<p>first: 1</p>
			<p>second: bar</p>
		` );

		assert.equal( component.get().first, '1' );
		assert.equal( component.get().second, 'bar' );

		component.destroy();
	}
};
