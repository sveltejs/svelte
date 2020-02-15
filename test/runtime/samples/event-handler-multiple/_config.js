export default {
	html: `
		<button>click me</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.equal(component.clickHandlerOne, 1);
		assert.equal(component.clickHandlerTwo, 1);
	}
};
