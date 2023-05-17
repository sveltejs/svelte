export default {
	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const click = new window.MouseEvent('click');

		assert.htmlEqual(target.innerHTML, '<div style="background: red;"></div>');
		await div.dispatchEvent(click);
		await Promise.resolve();
		assert.htmlEqual(target.innerHTML, '<div style=""></div>');
	}
};
