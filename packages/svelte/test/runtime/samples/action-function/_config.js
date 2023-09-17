export default {
	html: `
		<button>action</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event_enter = new window.MouseEvent('mouseenter');
		const event_leave = new window.MouseEvent('mouseleave');

		await button.dispatchEvent(event_enter);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an Action</div>
		`
		);

		await button.dispatchEvent(event_leave);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
		`
		);
	}
};
