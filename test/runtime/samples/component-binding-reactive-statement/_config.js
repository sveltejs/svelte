export default {
	html: `
		<button>main 0</button>
		<button>button 0</button>
	`,

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('click');

		const buttons = target.querySelectorAll('button');

		await buttons[0].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>main 1</button>
			<button>button 1</button>
		`);

		await buttons[1].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>main 2</button>
			<button>button 2</button>
		`);

		// reactive update, reset to 2
		await buttons[0].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>main 2</button>
			<button>button 2</button>
		`);

		// bound to main, reset to 2
		await buttons[1].dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>main 2</button>
			<button>button 2</button>
		`);
	}
};
