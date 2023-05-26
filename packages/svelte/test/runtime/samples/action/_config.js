export default {
	html: `
		<button>action</button>
	`,

	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const eventEnter = new window.MouseEvent('mouseenter');
		const eventLeave = new window.MouseEvent('mouseleave');

		await button.dispatchEvent(eventEnter);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
			<div class="tooltip">Perform an Action</div>
		`
		);

		await button.dispatchEvent(eventLeave);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>action</button>
		`
		);
	}
};
