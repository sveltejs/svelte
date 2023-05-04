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

		const inputEvent = new window.InputEvent('input');
		const clickEvent = new window.MouseEvent('click');

		input.value = 'foo';
		await input.dispatchEvent(inputEvent);

		assert.htmlEqual(target.innerHTML, `
		<input>
		<div>foo</div>
		<div>foo</div>
		<button>click me</button>
		`);

		await button.dispatchEvent(clickEvent);
		assert.htmlEqual(target.innerHTML, `
		<input>
		<div>foo</div>
		<div>clicked</div>
		<button>click me</button>
		`);

		input.value = 'bar';
		await input.dispatchEvent(inputEvent);

		assert.htmlEqual(target.innerHTML, `
		<input>
		<div>bar</div>
		<div>bar</div>
		<button>click me</button>
		`);
	}
};
