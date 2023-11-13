import { test } from '../../test';

export default test({
	get props() {
		return { items: ['a', 'b', 'c'] };
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

		/** @type {string[]} */
		const clicks = [];

		component.$on('foo', (/** @type {CustomEvent} */ event) => {
			clicks.push(event.detail);
		});

		const event = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(event);
		buttons[2].dispatchEvent(event);

		assert.deepEqual(clicks, ['a', 'c']);
	}
});
