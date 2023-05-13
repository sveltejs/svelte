export default {
	html: `
		<button>click me</button>
		<p>1</p>
		<p>2</p>
		<p>3</p>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click me</button>
			<p>2</p>
			<p>4</p>
			<p>6</p>
		`
		);
	}
};
