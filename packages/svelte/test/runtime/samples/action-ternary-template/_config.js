export default {
	get props() {
		return { target: 'World!', display: true };
	},

	html: `
		<h1></h1>
	`,

	async test({ assert, target, window }) {
		const header = target.querySelector('h1');
		const click = new window.MouseEvent('click');

		await header.dispatchEvent(click);
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello World!</h1>
		`
		);
	}
};
