export default {
	html: `
		<button>Click Me</button>
		Hello World
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');

		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>Click Me</button>
				Bye World
			`
		);
	}
};
