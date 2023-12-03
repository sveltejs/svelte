export default {
	async test({ assert, target, window }) {
		const increment_button = target.querySelector('button');

		assert.equal(target.querySelector('#render-count').innerHTML, '1');
		await increment_button.dispatchEvent(new window.MouseEvent('click'));
		assert.equal(target.querySelector('#render-count').innerHTML, '2');
	}
};
