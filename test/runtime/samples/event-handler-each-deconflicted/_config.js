export default {
	data: {
		foo: [ 1 ],
		bar: [ 2 ],
		clicked: 'neither'
	},

	html: `
		<button>foo</button>
		<button>bar</button>
		<p>clicked: neither</p>
	`,

	test ( assert, component, target, window ) {
		const buttons = target.querySelectorAll( 'button' );
		const event = new window.MouseEvent( 'click' );

		buttons[0].dispatchEvent( event );
		assert.equal( component.get().clicked, 'foo' );
		assert.htmlEqual( target.innerHTML, `
			<button>foo</button>
			<button>bar</button>
			<p>clicked: foo</p>
		` );

		buttons[1].dispatchEvent( event );
		assert.equal( component.get().clicked, 'bar' );
		assert.htmlEqual( target.innerHTML, `
			<button>foo</button>
			<button>bar</button>
			<p>clicked: bar</p>
		` );

		component.destroy();
	}
};
