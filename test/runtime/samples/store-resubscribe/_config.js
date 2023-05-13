export default {
	html: `
		<h1>0</h1>
		<button>+1</button>
		<button>reset</button>
	`,

	async test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click');

		await buttons[0].dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>1</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);

		await buttons[1].dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>0</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);

		await buttons[0].dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>1</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);
	}
};
