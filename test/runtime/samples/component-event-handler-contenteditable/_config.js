export default {
	html: `
		<div contenteditable=""></div>
	`,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');
		const text =  window.document.createTextNode('a');
		div.insertBefore(text, null);
		const event = new window.InputEvent('input');
		await div.dispatchEvent(event);

		assert.equal(div.textContent, 'a');
	}
};
