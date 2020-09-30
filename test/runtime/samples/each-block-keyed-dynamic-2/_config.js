export default {
	html: `
	<button>Click Me</button>
	0
	<ul></ul>
	`,

	async test({ assert, component, target, window }) {
		const button = target.querySelector('button');

		const event = new window.MouseEvent('click');
		await button.dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Click Me</button>
			1
			<ul></ul>
		`
		);
	}
};
