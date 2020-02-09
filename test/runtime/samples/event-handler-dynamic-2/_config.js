export default {
	html: `
		<button>toggle</button>
		<p>0</p>
		<button>handler_a</button>
		<button>handler_b</button>
	`,

	async test({ assert, target, window }) {
		const [toggle, handler_a, handler_b] = target.querySelectorAll(
			'button'
		);

		const event = new window.MouseEvent('click');

		await handler_a.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
			<p>1</p>
			<button>handler_a</button>
			<button>handler_b</button>
		`);

		await toggle.dispatchEvent(event);

		await handler_a.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
			<p>2</p>
			<button>handler_a</button>
			<button>handler_b</button>
		`);

		await toggle.dispatchEvent(event);

		await handler_b.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
			<p>1</p>
			<button>handler_a</button>
			<button>handler_b</button>
		`);

		await toggle.dispatchEvent(event);

		await handler_b.dispatchEvent(event);
		assert.htmlEqual(target.innerHTML, `
			<button>toggle</button>
			<p>2</p>
			<button>handler_a</button>
			<button>handler_b</button>
		`);
	},
};
