export default {
	async test({ assert, target, window, }) {
		assert.htmlEqual(target.innerHTML, `
			<button>Click me</button>
			<div><p attr="value">Value: a</p><p>bar</p></div>
		`);

		const btn = target.querySelector('button');
		const clickEvent = new window.MouseEvent('click');

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(target.innerHTML, `
			<button>Click me</button>
			<div><p attr="value">Value: b</p><p>bar</p></div>
		`);
	}
};
