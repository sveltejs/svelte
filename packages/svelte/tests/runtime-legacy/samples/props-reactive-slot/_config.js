import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<h1>hi</h1>
		<button>Change</button>
	`,

	test({ assert, target, window }) {
		const btn = target.querySelector('button');
		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		btn?.dispatchEvent(clickEvent);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>changed</h1>
			<button>Change</button>
		`
		);
	}
});
