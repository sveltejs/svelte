export default {
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const p = target.querySelector('p');
		const eventClick = new window.MouseEvent('click');
		
		await button.dispatchEvent(eventClick);
		assert.htmlEqual(p.innerHTML, 'True');
	}
};
