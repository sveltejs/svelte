export default {
	html: '<button>0, 0</button>',
	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'click', {
			clientX: 42,
			clientY: 42
		});

		const button = target.querySelector( 'button' );

		button.dispatchEvent( event );

		assert.equal( target.innerHTML, '<button>42, 42</button>' );
	}
};
