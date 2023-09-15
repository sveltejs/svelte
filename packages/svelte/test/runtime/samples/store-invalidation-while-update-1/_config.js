export default {
	html: `
		<input>
		<div></div>
		<div>simple</div>
		<button>click me</button>
	`,
	ssrHtml: `
		<input value="">
		<div></div>
		<div>simple</div>
		<button>click me</button>
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		const button = target.querySelector('button');

		const input_event = new window.InputEvent('input');
		const click_event = new window.MouseEvent('click');

		input.value = 'foo';
		await input.dispatchEvent(input_event);

		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>foo</div>
		<div>foo</div>
		<button>click me</button>
		`
		);

		await button.dispatchEvent(click_event);
		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>foo</div>
		<div>clicked</div>
		<button>click me</button>
		`
		);

		input.value = 'bar';
		await input.dispatchEvent(input_event);

		assert.htmlEqual(
			target.innerHTML,
			`
		<input>
		<div>bar</div>
		<div>bar</div>
		<button>click me</button>
		`
		);
	}
};
