export default {
	test(assert, component, target, window) {
		assert.equal(component.get().events.toString(), '');
		const event1 = new window.Event('mouseenter');
		window.document.dispatchEvent(event1);
		assert.equal(component.get().events.toString(), 'enter');
		const event2 = new window.Event('mouseleave');
		window.document.dispatchEvent(event2);
		assert.equal(component.get().events.toString(), 'enter,leave');
	},
};