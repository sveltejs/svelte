import { test } from '../../test';

export default test({
	test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		/** @type {string[]} */
		const selected = [];

		component.$on('select', (/** @type {CustomEvent} */ event) => {
			selected.push(event.detail);
		});

		buttons[1].dispatchEvent(click);
		buttons[2].dispatchEvent(click);
		buttons[1].dispatchEvent(click);
		buttons[0].dispatchEvent(click);

		assert.deepEqual(selected, ['bar', 'baz', 'bar', 'foo']);
	}
});
