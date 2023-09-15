export default {
	html: `
	<button>Click Me</button>
	<div>Icon B</div>
	`,

	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const click_event = new window.MouseEvent('click');

		await btn.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon A</div>
			`
		);

		await btn.dispatchEvent(click_event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			<div>Icon B</div>
			`
		);
	}
};
