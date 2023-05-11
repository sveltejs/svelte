// A browser test because JSDOM doesn't support contenteditable
export default {
	html: '<div contenteditable=""></div>',

	// Failing test for https://github.com/sveltejs/svelte/issues/5018, fix pending
	// It's hard to fix this because in order to do that, we would need to change the
	// way the value is compared completely. Right now it compares the value of the
	// first text node, but it should compare the value of the whole content
	skip: true,

	async test({ assert, target, window }) {
		const div = target.querySelector('div');

		let text = window.document.createTextNode('a');
		div.insertBefore(text, null);
		let event = new window.InputEvent('input');
		await div.dispatchEvent(event);
		assert.equal(div.textContent, 'a');

		// When a user types a newline, the browser inserts a <div> element
		const inner_div = window.document.createElement('div');
		div.insertBefore(inner_div, null);
		event = new window.InputEvent('input');
		await div.dispatchEvent(event);
		assert.equal(div.textContent, 'a');

		text = window.document.createTextNode('b');
		inner_div.insertBefore(text, null);
		event = new window.InputEvent('input');
		await div.dispatchEvent(event);
		assert.equal(div.textContent, 'ab');
	}
};
