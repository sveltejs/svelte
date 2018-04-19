export default {
	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>

		<p>fromDom: </p>
		<p>fromState: </p>
	`,

	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'click' );

		const buttons = target.querySelectorAll( 'button' );

		buttons[1].dispatchEvent( event );

		assert.htmlEqual( target.innerHTML, `
			<button>foo</button>
			<button>bar</button>
			<button>baz</button>

			<p>fromDom: bar</p>
			<p>fromState: bar</p>
		` );

		assert.equal( component.get().fromDom, 'bar' );
		assert.equal( component.get().fromState, 'bar' );

		component.destroy();
	}
};
