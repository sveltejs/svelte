// A browser test because JSDOM doesn't support contenteditable
export default {
	html: '<div contenteditable="true"></div>',
	ssrHtml: '<div contenteditable=""></div>',

	async test({ assert, target, window }) {
		// this tests that by going from contenteditable=true to false, the
		// content is correctly updated before that. This relies on the order
		// of the updates: first updating the content, then setting contenteditable
		// to false, which means that `set_data_maybe_contenteditable` is used and not `set_data`.
		// If the order is reversed, https://github.com/sveltejs/svelte/issues/5018
		// would be happening. The caveat is that if we go from contenteditable=false to true
		// then we will have the same issue. To fix this reliably we probably need to
		// overhaul the way we handle text updates in general.
		// If due to some refactoring this test fails, it's probably fine to ignore it since
		// this is a very specific edge case and the behavior is unstable anyway.
		const div = target.querySelector('div');
		const text = window.document.createTextNode('a');
		div.insertBefore(text, null);
		const event = new window.InputEvent('input');
		await div.dispatchEvent(event);
		assert.equal(div.textContent, 'a');
	}
};
