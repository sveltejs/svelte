export default {
	html: `
		<button>clicked: false</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		await button.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>clicked: true</button>
		`);
	}
};
