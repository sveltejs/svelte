export default {
	test({ assert, component, target, window }) {
		assert.deepEqual(component.events, []);

		const event1 = new window.Event('mouseenter');
		window.document.dispatchEvent(event1);
		assert.deepEqual(component.events, ['enter']);

		const event2 = new window.Event('mouseleave');
		window.document.dispatchEvent(event2);
		assert.deepEqual(component.events, ['enter', 'leave']);
	},
};