export default {
	'skip-ssr': true,

	html: '<button>10</button>',

	test ( assert, component, target, window ) {
		const event = new window.MouseEvent( 'click' );

		const button = target.querySelector( 'button' );

		button.dispatchEvent( event );

		assert.equal( target.innerHTML, '<button>11</button>' );
	}
};
