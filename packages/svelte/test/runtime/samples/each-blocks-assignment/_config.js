export default {
	html: `
	<button>Add</button>
	<span class="content">1</span>
	<button>Test</button>
	<span class="content">2</span>
	<button>Test</button>
	<span class="content">3</span>
	<button>Test</button>
	`,
	async test({ assert, target, window }) {
		let [incrementBtn, ...buttons] = target.querySelectorAll('button');

		const clickEvent = new window.MouseEvent('click');
		await buttons[0].dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">3</span>
			<button>Test</button>
		`
		);

		await buttons[0].dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">3</span>
			<button>Test</button>
		`
		);

		await buttons[2].dispatchEvent(clickEvent);
		await buttons[2].dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
		`
		);

		await incrementBtn.dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
			<span class="content">4</span>
			<button>Test</button>
		`
		);

		[incrementBtn, ...buttons] = target.querySelectorAll('button');

		await buttons[3].dispatchEvent(clickEvent);

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>Add</button>
			<span class="content">4</span>
			<button>Test</button>
			<span class="content">2</span>
			<button>Test</button>
			<span class="content">12</span>
			<button>Test</button>
			<span class="content">8</span>
			<button>Test</button>
		`
		);
	}
};
