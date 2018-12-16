export default {
	props: {
		items: ['a', 'b', 'c']
	},

	html: `
		<div>
			<button>click me</button>
			<button>click me</button>
			<button>click me</button>
		</div>
	`,

	test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');

		const clicks = [];

		component.$on('foo', event => {
			clicks.push(event.detail);
		});

		const event = new window.MouseEvent('click');

		buttons[0].dispatchEvent(event);
		buttons[2].dispatchEvent(event);

		assert.deepEqual(clicks, ['a', 'c']);
	}
};
