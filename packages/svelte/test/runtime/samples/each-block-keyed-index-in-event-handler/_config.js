export default {
	html: `
		<button>remove</button>
		<button>remove</button>
		<button>remove</button>
	`,

	async test({ assert, target, window }) {
		const click = new window.MouseEvent('click');

		await target.querySelectorAll('button')[1].dispatchEvent(click);
		await target.querySelectorAll('button')[1].dispatchEvent(click);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>remove</button>
		`
		);
	}
};
