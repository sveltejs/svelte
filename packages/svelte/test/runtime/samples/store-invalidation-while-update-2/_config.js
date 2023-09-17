export default {
	html: `
		<div></div>
		<div>simple</div>
		<input>
		<button>click me</button>
	`,
	ssrHtml: `
		<div></div>
		<div>simple</div>
		<input value="">
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
		<div>foo</div>
		<div>foo</div>
		<input>
		<button>click me</button>
		`
		);

		await button.dispatchEvent(click_event);
		assert.htmlEqual(
			target.innerHTML,
			`
		<div>foo</div>
		<div>clicked</div>
		<input>
		<button>click me</button>
		`
		);

		input.value = 'bar';
		await input.dispatchEvent(input_event);

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>bar</div>
		<div>bar</div>
		<input>
		<button>click me</button>
		`
		);
	}
};
