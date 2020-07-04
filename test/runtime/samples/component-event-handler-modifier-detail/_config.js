export default {
	html: `
		<button>apple</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.equal(component.selected, "apple");
	}
};
