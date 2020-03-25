export default {
	html: `
		<button>1</button>
	`,

	async test({ assert, target, window, }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.MouseEvent('click');

		await btn.dispatchEvent(clickEvent);

		assert.htmlEqual(target.innerHTML, `
			<button>2</button>
		`);
	}
};
