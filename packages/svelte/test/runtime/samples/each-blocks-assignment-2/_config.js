export default {
	html: `
		<span class="content">foo</span>
		<button>Test</button>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');

		const click_event = new window.MouseEvent('click');
		await button.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<span class="content">bar</span>
			<button>Test</button>
		`
		);
	}
};
