export default {
	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const click = new window.MouseEvent( 'click' );

		assert.htmlEqual( target.innerHTML, `<button>0</button>` );
		button.dispatchEvent( click );
		assert.htmlEqual( target.innerHTML, `<button>1</button>` );
	}
};
