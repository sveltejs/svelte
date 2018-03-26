export default {
	html: `<button>0</button>`,

	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const click = new window.MouseEvent( 'click' );

		button.dispatchEvent( click );
		assert.htmlEqual( target.innerHTML, `<button>1</button>` );
	}
};
