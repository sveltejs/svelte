export default {
	async test({ assert, target, window, raf }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		await button.dispatchEvent(event);
		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '');
	}
};
