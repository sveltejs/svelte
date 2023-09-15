export default {
	html: `
		<h1>hi</h1>
		<button>Change</button>
	`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const click_event = new window.MouseEvent('click');

		await btn.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>changed</h1>
			<button>Change</button>
		`
		);
	}
};
