import { test } from '../../test';

// TODO gah, JSDOM appears to behave differently to real browsers here... probably need to raise an issue

export default test({
	html: '<input>',

	test({ assert, component }) {
		component.input.focus();

		// this should NOT trigger blur event
		component.visible = false;
		assert.ok(!component.blurred);

		component.visible = true;
		component.input.focus();

		// this SHOULD trigger blur event
		component.input.blur();
		assert.ok(component.blurred);
	}
});
