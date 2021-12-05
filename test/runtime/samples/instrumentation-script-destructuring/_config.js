export default {
	html: `
		<button>foo</button>
		<button>bar</button>

		<p>x: 0</p>
	`,

	async test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await buttons[0].dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, `
			<button>foo</button>
			<button>bar</button>

			<p>x: 1</p>
		`);

		await buttons[1].dispatchEvent(click);
		assert.htmlEqual(target.innerHTML, `
			<button>foo</button>
			<button>bar</button>

			<p>x: 2</p>
		`);
	}
};
