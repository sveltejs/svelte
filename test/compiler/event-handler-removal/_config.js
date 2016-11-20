import * as assert from 'assert';

// TODO gah, JSDOM appears to behave differently to real browsers here... probably need to raise an issue

export default {
	html: '<input><!--#if visible-->',
	test ( component ) {
		component.refs.input.focus();

		// this should NOT trigger blur event
		component.set({ visible: false });
		assert.ok( !component.get( 'blurred' ) );

		component.set({ visible: true });
		component.refs.input.focus();

		// this SHOULD trigger blur event
		component.refs.input.blur();
		assert.ok( component.get( 'blurred' ) );
	}
};
