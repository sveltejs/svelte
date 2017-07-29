export default {
	html: `
		<button>click me</button>
	`,

	test (assert, component, target, window) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		button.dispatchEvent(event);
		assert.ok(component.clicked);
	}
};
