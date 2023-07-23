export default {
	html: `
		<div>
			<button>click me</button>
		</div>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		await button.parentNode.dispatchEvent(event);
		assert.ok(!component.clicked);

		await button.dispatchEvent(event);
		assert.ok(component.clicked);
	}
};
