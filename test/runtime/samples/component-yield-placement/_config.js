export default {
	data: {
		showModal: true
	},

	html: `
		<div class='modal-background'></div>

		<div class='modal'>
			<slot><h2>Hello!</h2></slot>
			<button>close modal</button>
		</div>
	`,

	test ( assert, component, target, window ) {
		const button = target.querySelector( 'button' );
		const click = new window.MouseEvent( 'click' );

		button.dispatchEvent( click );

		assert.htmlEqual( target.innerHTML, `
			<button>show modal</button>
		`);
	}
};
