export default {
	html: `
		<button>click me</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click', {
			cancelable: true
		});

		await button.dispatchEvent(event);

		assert.ok(component.default_was_prevented);
	}
};
