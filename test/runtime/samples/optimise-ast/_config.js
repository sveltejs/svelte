export default {
	html: `<button>Clicked 0 times</button>`,
	async test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click');
		await buttons[0].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `<button>Clicked 1 time</button>`);

		await buttons[0].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `<button>Clicked 2 times</button>`);
	},
};
