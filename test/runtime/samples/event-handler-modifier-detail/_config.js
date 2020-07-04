export default {
	html: `
		<button>click me</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.CustomEvent('click', { detail: 1 });

		await button.dispatchEvent(event);

		assert.ok(component.button === 1);
	}
};
