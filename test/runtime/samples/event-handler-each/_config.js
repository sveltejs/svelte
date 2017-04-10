export default {
	data: {
		items: [
			'foo',
			'bar',
			'baz'
		],
		selected: 'foo'
	},

	html: `
		<button>foo</button>
		<button>bar</button>
		<button>baz</button>
		<p>selected: foo</p>
	`,

	test ( assert, component, target, window ) {
		const buttons = target.querySelectorAll( 'button' );
		const event = new window.MouseEvent( 'click' );

		buttons[1].dispatchEvent( event );
		assert.htmlEqual( target.innerHTML, `
			<button>foo</button>
			<button>bar</button>
			<button>baz</button>
			<p>selected: bar</p>
		` );

		component.destroy();
	}
};
