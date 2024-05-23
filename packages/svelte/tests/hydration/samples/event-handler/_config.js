import { flushSync } from 'svelte';
import { assert_ok, test } from '../../test';

export default test({
	props: {
		clicked: false
	},

	snapshot(target) {
		const button = target.querySelector('button');

		return {
			button
		};
	},

	async test(assert, target, _, component, window) {
		const button = target.querySelector('button');
		assert_ok(button);
		button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();

		assert.ok(component.clicked);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click me</button>
			<p>clicked!</p>
		`
		);
	}
});
