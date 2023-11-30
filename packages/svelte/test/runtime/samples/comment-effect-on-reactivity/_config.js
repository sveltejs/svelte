export default {
	async test({ assert, target, window }) {
		const incrementButton = target.querySelector('button');

		assert.equal(target.querySelector('#render-count').innerHTML, '1');
		await incrementButton.dispatchEvent(new window.MouseEvent('click'));
		assert.equal(target.querySelector('#render-count').innerHTML, '2');
	}
};
