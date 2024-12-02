import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>foo</button>
		<p>x: 0</p>
	`,

	test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>foo</button>
			<p>x: 42</p>
		`
		);
	}
});
