export default {
	async test({ assert, target, raf }) {
		const button = target.querySelector('#button');
		const container = target.querySelector('#container');

		// Multiple click on button
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));
		await button.dispatchEvent(new window.MouseEvent('click'));

		assert.equal(container.children.length, 1);
		raf.tick(501);
		assert.equal(container.children.length, 0);
	}
};
