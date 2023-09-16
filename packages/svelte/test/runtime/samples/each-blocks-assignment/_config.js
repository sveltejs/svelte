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
		let [increment_btn, ...buttons] = target.querySelectorAll('button');

		const click_event = new window.MouseEvent('click');
		await buttons[0].dispatchEvent(click_event);

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

		await buttons[0].dispatchEvent(click_event);

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

		await buttons[2].dispatchEvent(click_event);
		await buttons[2].dispatchEvent(click_event);

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

		await increment_btn.dispatchEvent(click_event);

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

		[increment_btn, ...buttons] = target.querySelectorAll('button');

		await buttons[3].dispatchEvent(click_event);

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
