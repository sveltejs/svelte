export default {
	html: `
		<button>click me now</button>
	`,

	test({ assert, component, target, window }) {
		const button = target.querySelector('button');
		const event = new window.Event('click-now');

		let clicked;
		component.$on('click-now', () => {
			clicked = true;
		});

		button.dispatchEvent(event);
		assert.ok(clicked);
	}
};
