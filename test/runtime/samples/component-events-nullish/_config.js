export default {
	async test({ assert, component, window, target }) {
		const event = new window.MouseEvent('click');
		const button = target.querySelector('button');

		await button.dispatchEvent(event);
		assert.equal(component.logs.length, 0);
	}
};
