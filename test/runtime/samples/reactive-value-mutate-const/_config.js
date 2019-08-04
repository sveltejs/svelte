export default {
	html: `
		<button>Mutate a</button>
		<div>{}</div>
	`,

	async test({ assert, target }) {
		const button = target.querySelector('button');
		const click = new window.MouseEvent('click');

		await button.dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, `
			<button>Mutate a</button>
			<div>{"foo":42}</div>
		`);
	}
};
