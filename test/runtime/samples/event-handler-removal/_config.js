// TODO gah, JSDOM appears to behave differently to real browsers here... probably need to raise an issue

export default {
	html: '<input><!---->',
	test ( assert, component ) {
		component.refs.input.focus();

		// this should NOT trigger blur event
		component.visible = false;
		assert.ok( !component.blurred );

		component.visible = true;
		component.refs.input.focus();

		// this SHOULD trigger blur event
		component.refs.input.blur();
		assert.ok( component.blurred );
	}
};
