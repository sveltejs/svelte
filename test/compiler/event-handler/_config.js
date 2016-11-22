export default {
	html: '<button>toggle</button>\n\n<!--#if visible-->',
	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const event = new window.MouseEvent( 'click' );

		button.dispatchEvent( event );
		assert.equal( target.innerHTML, '<button>toggle</button>\n\n<p>hello!</p><!--#if visible-->' );

		button.dispatchEvent( event );
		assert.equal( target.innerHTML, '<button>toggle</button>\n\n<!--#if visible-->' );
	}
};
