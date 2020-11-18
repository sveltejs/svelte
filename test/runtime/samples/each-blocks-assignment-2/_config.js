export default {
	html: `
		<span class="content">foo</span>
		<button>Test</button>
	`,
	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');

		const clickEvent = new window.MouseEvent('click');
		await button.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<span class="content">bar</span>
			<button>Test</button>
		`
		);
	}
};
