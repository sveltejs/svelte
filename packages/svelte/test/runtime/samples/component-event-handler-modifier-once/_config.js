export default {
	html: `
		<button>0</button>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.equal(component.count, 1);

		await button.dispatchEvent(event);
		assert.equal(component.count, 1);
	}
};
