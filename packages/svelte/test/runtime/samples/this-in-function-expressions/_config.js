export default {
	async test({ assert, target, window }) {
		const [, btn] = target.querySelectorAll('button');
		const click_event = new window.MouseEvent('click');

		await btn.dispatchEvent(click_event);

		assert.equal(btn.x, 1);
	}
};
