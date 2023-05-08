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

		const inputEvent = new window.InputEvent('input');
		const clickEvent = new window.MouseEvent('click');

		input.value = 'foo';
		await input.dispatchEvent(inputEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
		<div>foo</div>
		<div>foo</div>
		<input>
		<button>click me</button>
		`
		);

		await button.dispatchEvent(clickEvent);
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
		await input.dispatchEvent(inputEvent);

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
