// A puppeteer test because JSDOM doesn't support contenteditable
export default {
	html: '<div contenteditable="false"></div>',

	async test({ assert, target, component, window }) {
		const div = target.querySelector('div');
		const text =  window.document.createTextNode('a');
		div.insertBefore(text, null);
		assert.equal(div.textContent, 'a');
		component.text = 'bcde';
		assert.equal(div.textContent, 'bcdea');
	}
};
