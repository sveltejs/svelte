export default {
	test ( assert, component, target, window ) {
		const testStyles = ([control, test]) => {
			assert.equal( window.getComputedStyle( control ).color, 'blue' );
			assert.equal( window.getComputedStyle( test ).color, 'red' );
		};

		const iframe = window.document.createElement('iframe');
		window.document.body.appendChild(iframe);
		const otherTarget = iframe.contentWindow.document.body;

		new component.constructor({
			target: otherTarget
		});

		testStyles(target.querySelectorAll( 'p' ));
		testStyles(otherTarget.querySelectorAll( 'p' ));
	}
};
